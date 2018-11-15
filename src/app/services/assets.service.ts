import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as AmbrosusSDK from 'ambrosus-javascript-sdk';
import { environment } from 'environments/environment.prod';
import { map, catchError } from 'rxjs/operators';

declare let Web3: any;

@Injectable()
export class AssetsService {
  inputChanged = new Subject();
  private _events: BehaviorSubject<any> = new BehaviorSubject({
    meta: {},
    data: [],
    pagination: {},
  });
  private _assets: BehaviorSubject<any> = new BehaviorSubject({
    meta: {},
    data: [],
    pagination: {},
  });
  ambrosus;
  web3;
  api;

  to = (O: Observable<any>) =>
    O.toPromise()
      .then(response => [null, response])
      .catch(error => [error]);

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
  ) {
    this.initSDK();
    this.web3 = new Web3();
    this.api = environment.api;
    this.loadAssets();
  }

  loadAssets() {
    const account = <any>this.storageService.get('account') || {};
    const { address } = account;
    const options = {
      limit: 15,
      address,
    };
    this.getAssets(options).then();
  }

  get assets(): any {
    return this._assets.asObservable();
  }
  get events(): any {
    return this._events.asObservable();
  }

  set events(options) {
    if (options && options.data) {
      options = JSON.parse(JSON.stringify(options));
      options.data = this.parseTimelineEvents(options.data);
      const events = this._events.getValue();
      if (options.change === 'data' && Array.isArray(options.data)) {
        switch (options.type) {
          case 'all':
            events['data'] = options.data;
            break;
          case 'start':
            options.data.map(event => events.data.unshift(event));
            break;
          case 'end':
            events.data = events.data.concat(options.data);
            break;
        }
        this._events.next(events);
      } else if (options.change === 'reset') {
        delete options.change;
        this._events.next(options);
      } else {
        const data = events.data.concat(options.data);
        options.data = data;
        this._events.next(options);
      }
    }
  }

  set assets(options) {
    if (options && options.data) {
      options = JSON.parse(JSON.stringify(options));
      const assets = this._assets.getValue();
      if (options.change === 'data' && Array.isArray(options.data)) {
        switch (options.type) {
          case 'all':
            assets['data'] = options.data;
            break;
          case 'start':
            options.data.map(asset => assets.data.unshift(asset));
            break;
          case 'end':
            assets.data = assets.data.concat(options.data);
            break;
        }
        this._assets.next(assets);
      } else {
        const data = assets.data.concat(options.data);
        options.data = data;
        this._assets.next(options);
      }
    }
  }

  initSDK() {
    const secret = this.storageService.get('secret');
    const token = this.storageService.get('token');

    this.ambrosus = new AmbrosusSDK({
      secret,
      Web3,
      headers: {
        Authorization: `AMB_TOKEN ${token}`,
      },
    });
  }

  async getAssets(options: {
    address?: String;
    limit?: Number;
    next?: String;
  }) {
    const { address, limit, next } = options;

    let url = `${this.api.extended}/asset/query`;
    let body: any = {
      query: [
        {
          field: 'content.idData.createdBy',
          value: address,
          operator: 'equal',
        },
      ],
      limit,
      next,
    };

    const [error, assets] = await this.to(this.http.post(url, body));
    if (error) {
      return console.error('[GET] Assets: ', error);
    }
    console.log('[GET] Assets: ', assets);

    const ids = assets.data.reduce((_ids, asset, index, array) => {
      _ids.push(asset.assetId);
      return _ids;
    }, []);

    // Get latest info events
    url = `${this.api.extended}/event/latest/type`;
    body = {
      type: 'ambrosus.asset.info',
      assets: ids,
    };

    const [err, infoEvents] = await this.to(this.http.post(url, body));
    if (err) {
      return console.error('[GET] Events: ', err);
    }
    console.log('[GET] Info events: ', infoEvents);

    // Connect assets with info events
    assets.data = assets.data.map(asset => {
      asset.infoEvent = infoEvents.data.find(
        event => asset.assetId === event.content.idData.assetId,
      );

      if (asset.infoEvent) {
        asset.infoEvent = this.findEvent('info', [asset.infoEvent]);
      }

      return asset;
    });

    this.assets = assets;
  }

  getAsset(assetId: String): Observable<any> {
    let url = `${this.api.extended}/asset/query`;
    let body: any = {
      query: [
        {
          field: 'assetId',
          value: assetId,
          operator: 'equal',
        },
      ],
    };

    return this.http.post(url, body).pipe(
      map(async (assets: any) => {
        const ids = assets.data.reduce((_ids, asset, index, array) => {
          _ids.push(asset.assetId);
          return _ids;
        }, []);

        // Get latest info events
        url = `${this.api.extended}/event/latest/type`;
        body = {
          type: 'ambrosus.asset.info',
          assets: [assetId],
        };

        const [err, infoEvents] = await this.to(this.http.post(url, body));
        if (err) {
          return throwError(err);
        }

        // Connect assets with info events
        assets.data[0]['infoEvent'] = this.findEvent('info', infoEvents.data);

        this.parseAsset(assets.data[0]);
        return assets;
      }),
      catchError(({ meta }: any) => meta),
    );
  }

  async getEvents(options: {
    assetId: String;
    limit?: Number;
    next?: String;
  }): Promise<void> {
    const { assetId, limit, next } = options;

    const url = `${this.api.extended}/event/query`;
    const body: any = {
      query: [
        {
          field: 'content.idData.assetId',
          value: assetId,
          operator: 'equal',
        },
      ],
      limit,
      next,
    };

    const [err, events] = await this.to(this.http.post(url, body));
    if (err) {
      return console.error('[GET] Events: ', err);
    }

    this.events = events;
  }

  getEvent(eventId: String): Observable<any> {
    const url = `${this.api.extended}/event/query`;
    const body: any = {
      query: [
        {
          field: 'eventId',
          value: eventId,
          operator: 'equal',
        },
      ],
    };

    return this.http.post(url, body).pipe(
      map((events: any) => events.data[0]),
      catchError(({ meta }: any) => meta),
    );
  }

  // Create methods

  createAssets(assets: Object[]): Observable<any> {
    const url = `${this.api.core}/assets`;
    const data = { created: [], errors: [] };

    assets.map(async (asset, index, array) => {
      const [error, assetCreated] = await this.to(this.http.post(url, asset));
      if (error) {
        data.errors.push({ asset, error });
      }
      if (assetCreated) {
        data.created.push(assetCreated);
      }

      if (index === array.length - 1) {
        data['change'] = 'data';
        data['type'] = 'start';
        data['data'] = data.created;
        this.assets = data;
      }
    });

    return of(data);
  }

  createEvents(events: Object[]): Observable<any> {
    const data = { created: [], errors: [] };

    try {
      events.map(async (event: any, index, array) => {
        const url = `${this.api.core}/assets/${
          event.content.idData.assetId
        }/events`;
        const [error, eventCreated] = await this.to(this.http.post(url, event));
        if (error) {
          data.errors.push({ event, error });
        }
        if (eventCreated) {
          data.created.push(eventCreated);
        }

        if (index === array.length - 1) {
          // Update _events
          const eventsData = this._events.getValue().data;
          if (eventsData && eventsData.length) {
            data['change'] = 'data';
            data['type'] = 'start';
            data['data'] = data.created;
            this.events = data;
          }

          // Update _assets
          let assetsData = this._assets.getValue().data;
          assetsData = assetsData.map(asset => {
            const assetEvents = data.created.filter(
              _event => asset.assetId === _event.content.idData.assetId,
            );
            const infoEvent = this.findEvent('info', assetEvents);
            if (infoEvent) {
              asset['infoEvent'] = infoEvent;
            }
            return asset;
          });
          const options = { change: 'data', type: 'all', data: assetsData };
          this.assets = options;
        }
      });

      return of(data);
    } catch (e) {
      return throwError(e);
    }
  }

  // UTILS

  getName(obj, alternative = 'No title') {
    try {
      const name = obj.name;
      let type = obj.type.split('.');
      type = type[type.length - 1];
      return [name, type].find(i => i);
    } catch (e) {
      return alternative;
    }
  }

  getImage(obj) {
    try {
      return obj.images.default.url;
    } catch (e) {
      return '/assets/raster/logotip.jpg';
    }
  }

  getLocation(event) {
    const location = event.location || event;
    const { city, country, name } = location;
    return (
      [city, country, name].filter(Boolean).join(', ') || 'No place attached'
    );
  }

  sortEventsByTimestamp(a, b) {
    if (a.timestamp > b.timestamp) {
      return -1;
    }
    if (a.timestamp < b.timestamp) {
      return 1;
    }
    return 0;
  }

  parseEvent(event) {
    let eventObjects = [];

    // Extract event objects
    if (event.content.data) {
      eventObjects = event.content.data.reduce((total, obj, index, array) => {
        const type = obj.type.split('.');
        obj.type = type[type.length - 1].toLowerCase();
        obj.eventId = event.eventId;
        obj.createdBy = event.content.idData.createdBy;
        obj.timestamp = event.content.idData.timestamp;

        if (obj.type === 'location' || obj.type === 'identifiers') {
          event.content.data.map(_obj => {
            if (['location', 'identifiers'].indexOf(_obj.type) === -1) {
              _obj[obj.type === 'location' ? 'location' : 'identifiers'] = obj;
            }
          });
        } else {
          total.push(obj);
        }

        return total;
      }, []);

      // Groups and properties
      eventObjects.map(eventObject => {
        eventObject['groups'] = [];
        eventObject['properties'] = [];
        Object.keys(eventObject).map((key: any) => {
          if (
            [
              'type',
              'name',
              'assetType',
              'documents',
              'images',
              'eventId',
              'createdBy',
              'timestamp',
              'location',
              'identifiers',
              'groups',
              'properties',
            ].indexOf(key) === -1
          ) {
            const property = {
              key,
              value: eventObject[key],
            };
            eventObject[
              typeof property.value === 'string' ||
              Array.isArray(property.value)
                ? 'properties'
                : 'groups'
            ].push(property);
          }
        });
      });
    }

    return eventObjects;
  }

  parseAsset(asset) {
    if (!asset.infoEvent) {
      asset.infoEvent = {};
    }
    // Groups and properties
    asset.infoEvent['groups'] = [];
    asset.infoEvent['properties'] = [];
    Object.keys(asset.infoEvent).map((key: any) => {
      if (
        [
          'type',
          'name',
          'assetType',
          'images',
          'eventId',
          'createdBy',
          'timestamp',
          'location',
          'identifiers',
          'groups',
          'properties',
        ].indexOf(key) === -1
      ) {
        const property = {
          key,
          value: asset.infoEvent[key],
        };
        asset.infoEvent[
          typeof property.value === 'string' || Array.isArray(property.value)
            ? 'properties'
            : 'groups'
        ].push(property);
      }
    });
  }

  parseTimelineEvents(e) {
    const events = e.reduce((_events, { content, eventId }) => {
      const timestamp = content.idData.timestamp;
      const author = content.idData.createdBy;

      if (content && content.data) {
        content.data.filter(obj => {
          const parts = obj.type.split('.');
          const type = parts[parts.length - 1];
          const category = parts[parts.length - 2] || 'asset';
          const namespace = parts[parts.length - 3] || 'ambrosus';

          obj.timestamp = timestamp;
          obj.author = author;
          obj.name = obj.name || type;
          obj.action = type;
          obj.type = type;
          obj.eventId = eventId;

          if (obj.type === 'location' && category === 'event') {
            content.data.reduce((location, _event) => {
              if (_event.type !== 'location') {
                _event.location = location;
              }
            }, obj);
          }

          const notInclude = ['location', 'identifier', 'identifiers'];
          if (notInclude.indexOf(obj.type) === -1) {
            _events.push(obj);
          }

          return obj;
        });
      }
      return _events;
    }, []);

    events.sort(this.sortEventsByTimestamp);

    return events;
  }

  sign(data, secret) {
    return this.web3.eth.accounts.sign(this.serializeForHashing(data), secret)
      .signature;
  }

  calculateHash(data) {
    return this.web3.eth.accounts.hashMessage(this.serializeForHashing(data));
  }

  serializeForHashing(object) {
    const isDict = subject =>
      typeof subject === 'object' && !Array.isArray(subject);
    const isString = subject => typeof subject === 'string';
    const isArray = subject => Array.isArray(subject);

    if (isDict(object)) {
      const content = Object.keys(object)
        .sort()
        .map(key => `"${key}":${this.serializeForHashing(object[key])}`)
        .join(',');
      return `{${content}}`;
    } else if (isArray(object)) {
      const content = object
        .map(item => this.serializeForHashing(item))
        .join(',');
      return `[${content}]`;
    } else if (isString(object)) {
      return `"${object}"`;
    }

    return object.toString();
  }

  validTimestamp(timestamp) {
    return new Date(timestamp).getTime() > 0;
  }

  isLatest(type) {
    return (
      ['info', 'redirection', 'identifiers', 'branding', 'location'].indexOf(
        type,
      ) === -1
    );
  }

  findEvent(eventType, events) {
    let e = false;
    events.map(event => {
      if (event.content.data) {
        event.content.data.map(obj => {
          const type = obj.type.split('.');
          obj.type = type[type.length - 1].toLowerCase();
          obj.eventId = event.eventId;
          obj.createdBy = event.content.idData.createdBy;
          obj.timestamp = event.content.idData.timestamp;

          if (obj.type === 'location' || obj.type === 'identifiers') {
            event.content.data.map(_obj => {
              if (['location', 'identifiers'].indexOf(_obj.type) === -1) {
                _obj[
                  obj.type === 'location' ? 'location' : 'identifiers'
                ] = obj;
              }
            });
          }

          switch (eventType) {
            case 'latest':
              if (this.isLatest(obj.type)) {
                e = obj;
              }
              break;
            default:
              if (obj.type === eventType) {
                e = obj;
              }
          }
        });
      }
    });
    return e;
  }
}
