import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as AmbrosusSDK from 'ambrosus-javascript-sdk';
import { environment } from 'environments/environment.prod';
import { map, catchError, tap } from 'rxjs/operators';

declare let Web3: any;

@Injectable()
export class AssetsService {
  inputChanged = new Subject();
  creatingAsset = new Subject();
  creatingEvent = new Subject();
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

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
  ) {
    this.initSDK();
    this.web3 = new Web3();
    this.api = environment.api;
    this.loadAssets();
  }

  to(O: Observable<any>) {
    return O.toPromise()
      .then(response => response)
      .catch(error => ({ error }));
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
  }): Promise<void> {
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

    const assets = await this.to(this.http.post(url, body));
    if (assets.error) {
      return console.error('[GET] Assets: ', assets.error);
    }
    console.log('[GET] Assets: ', assets.data);

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

    const infoEvents = await this.to(this.http.post(url, body));
    if (infoEvents.error) {
      return console.error('[GET] Events: ', infoEvents.error);
    }
    console.log('[GET] Info events: ', infoEvents.data);

    // Connect assets with info events
    assets.data = assets.data.map(asset => {
      asset.info = infoEvents.data.find(
        event => asset.assetId === event.content.idData.assetId,
      );

      if (asset.info) {
        asset.info = this.findEvent('info', [asset.info]);
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

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        (assets: any) => {
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

          this.http.post(url, body).subscribe(
            (infoEvents: any) => {
              assets.data[0]['info'] = this.findEvent(
                'info',
                infoEvents.data,
              );
              this.parseAsset(assets.data[0]);

              observer.next(assets.data[0]);
              observer.complete();
            },
            error => observer.error(error),
          );
        },
        ({ meta }: any) => observer.error(meta),
      );
    });
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

    const events = await this.to(this.http.post(url, body));
    if (events.error) {
      return console.error('[GET] Events: ', events.error);
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
      map((events: any) => this.parseEvent(events.data[0])),
      catchError(({ meta }: any) => meta),
    );
  }

  // Create methods

  createAsset(asset: Object): Observable<any> {
    const url = `${this.api.core}/assets`;
    const data = { created: [], errors: [] };

    return this.http.post(url, asset).pipe(
      tap(response => {
        this.creatingAsset.next(response);

        data['change'] = 'data';
        data['type'] = 'start';
        data['data'] = [response];
        this.assets = data;

        return response;
      }),
      catchError(error => {
        this.creatingAsset.error({ asset, error });
        return error;
      }),
    );
  }

  async createEvents(events: Object[]): Promise<any> {
    const data = { created: [], errors: [] };

    try {
      await events.map(async (event: any, index, array) => {
        const url = `${this.api.core}/assets/${
          event.content.idData.assetId
          }/events`;
        const eventCreated = await this.to(this.http.post(url, event));
        if (eventCreated.error) {
          data.errors.push({ event, error: eventCreated.error });
          this.creatingEvent.error({ event, error: eventCreated.error });
        } else {
          data.created.push(eventCreated);
          this.creatingEvent.next(eventCreated);
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
            const info = this.findEvent('info', assetEvents);
            if (info) {
              asset['info'] = info;
            }
            return asset;
          });
          const options = { change: 'data', type: 'all', data: assetsData };

          this.assets = options;
        }
      });

      return Promise.resolve(data);
    } catch (e) {
      return Promise.reject(data);
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

  getUrlName(url) {
    let name = url.split('/');
    name = name[name.length - 1];
    return name;
  }

  getImage(obj) {
    try {
      return obj.images.default.url;
    } catch (e) {
      return '/assets/raster/assets-image-default.png';
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
    event.info = {};
    event.info['groups'] = [];
    event.info['properties'] = [];

    // Extract event objects
    if (event.content.data && Array.isArray(event.content.data)) {
      event.content.data.map((obj, index, array) => {
        const type = obj.type.split('.');
        obj.type = type[type.length - 1].toLowerCase();

        if (obj.type === 'location' || obj.type === 'identifiers') {
          event.info[obj.type] = obj;
        } else {
          event.info.name = obj.name || obj.type;

          Object.keys(obj).map((key: any) => {
            if (['images', 'documents', 'description'].indexOf(key) > -1) {
              event.info[key] = obj[key];
            }

            if (
              [
                'type',
                'name',
                'assetType',
                'eventId',
                'createdBy',
                'timestamp',
                'location',
                'images',
                'documents',
                'description',
                'identifiers',
                'groups',
                'properties',
              ].indexOf(key) === -1
            ) {
              const property = {
                key,
                value: obj[key],
              };
              event.info[
                typeof property.value === 'string' ||
                  Array.isArray(property.value)
                  ? 'properties'
                  : 'groups'
              ].push(property);
            }
          });
        }

        return obj;
      });
    }

    return event;
  }

  parseAsset(asset) {
    if (!asset.info) {
      asset.info = {};
    }
    asset.info['groups'] = [];
    asset.info['properties'] = [];

    Object.keys(asset.info).map((key: any) => {
      if (key === 'location') {
        asset[key] = asset.info[key];
      } else {
        if (
          [
            'type',
            'name',
            'assetType',
            'images',
            'eventId',
            'createdBy',
            'timestamp',
            'identifiers',
            'groups',
            'properties',
          ].indexOf(key) === -1
        ) {
          const property = {
            key,
            value: asset.info[key],
          };
          asset.info[
            typeof property.value === 'string' || Array.isArray(property.value)
              ? 'properties'
              : 'groups'
          ].push(property);
        }
      }
    });
  }

  parseTimelineEvents(e) {
    const events = e.reduce((_events, { content, eventId }) => {
      const timestamp = content.idData.timestamp;
      const createdBy = content.idData.createdBy;

      if (content && content.data) {
        content.data.map(obj => {
          const parts = obj.type.split('.');
          const type = parts[parts.length - 1];
          const category = parts[parts.length - 2] || 'asset';
          const namespace = parts[parts.length - 3] || 'ambrosus';

          obj.timestamp = timestamp;
          obj.createdBy = createdBy;
          obj.name = obj.name || type;
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
