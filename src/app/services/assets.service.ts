import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as AmbrosusSDK from 'ambrosus-javascript-sdk';
import { environment } from 'environments/environment.prod';
import * as moment from 'moment-timezone';
import { MessageService } from 'app/services/message.service';

declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
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
  searchQuery: {
    from?: number,
    to?: number,
    name?: string,
    state?: any[],
    identifiers?: any[],
    location?: any,
    address?: string,
  } = {};
  ambrosus;
  web3;
  api;
  search = false;
  assetsReset = false;
  responses: any[] = [];
  progress: any = {
    title: '',
    creating: 0,
    for: 'assets',
    status: {
      asset: new Subject(),
      event: new Subject(),
      done: new Subject(),
    },
  };
  initiatedNoAssets = false;

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private messageService: MessageService,
  ) {
    this.initSDK();
    this.web3 = new Web3();
    this.api = environment.api;

    const account: any = this.storageService.get('account') || {};
    if (account.address) {
      this.getAssets().then();
    } else {
      this.initiatedNoAssets = true;
    }
  }

  to(O: Observable<any>) {
    return O.toPromise()
      .then(response => response)
      .catch(error => ({ error }));
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
    if (options) {
      options = JSON.parse(JSON.stringify(options));
      const assets = this._assets.getValue();

      if (options.clean) {
        console.log('clean');
        this._assets.next({
          meta: {},
          data: [],
          pagination: {},
        });
      } else if (options.change === 'data' && Array.isArray(options.data)) {
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
        options.data = assets.data.concat(options.data);
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

  async searchAssets(options: {
    limit?: number;
    next?: string;
  } = {}): Promise<any> {
    let { limit, next } = options;
    const { from, to, name, state, identifiers, location, address } = this.searchQuery;
    limit = limit || 15;
    next = next || '';

    // 1. Get events based on search query

    let url = `${this.api.extended}/event/query`;
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

    if (from && to) {
      body.query.push({
        field: 'content.idData.timestamp',
        value: { 'greater-than-equal': from, 'less-than-equal': to },
        operator: 'inrange',
      });
    }
    if (from && !to) {
      body.query.push({
        field: 'content.idData.timestamp',
        value: from,
        operator: 'greater-than-equal',
      });
    }
    if (to && !from) {
      body.query.push({
        field: 'content.idData.timestamp',
        value: to,
        operator: 'less-than-equal',
      });
    }
    if (name) {
      body.query.push({
        field: 'content.data.name',
        value: name,
        operator: 'contains',
      });
    }
    if (Array.isArray(state) && state.length) {
      body.query.push({
        field: 'content.data.type',
        value: state,
        operator: 'equal',
      });
    }
    if (Array.isArray(identifiers) && identifiers.length) {
      identifiers.map(identifier => {
        if (identifier.name && identifier.value) {
          body.query.push({
            field: `content.data.identifiers.${identifier.name}`,
            value: identifier.value,
            operator: 'equal',
          });
        }
      });
    }
    if (location) {
      const { city, country, GLN, locationId } = location;
      if (city) {
        body.query.push({
          field: 'content.data.city',
          value: city,
          operator: 'contains',
        });
      }
      if (country) {
        body.query.push({
          field: 'content.data.country',
          value: country,
          operator: 'contains',
        });
      }
      if (GLN) {
        body.query.push({
          field: 'content.data.GLN',
          value: GLN,
          operator: 'contains',
        });
      }
      if (locationId) {
        body.query.push({
          field: 'content.data.locationId',
          value: locationId,
          operator: 'contains',
        });
      }
    }

    const events = await this.to(this.http.post(url, body));
    if (events.error) {
      this.messageService.error(events.error);
      Promise.reject(events.error);
      return;
    }
    console.log('[GET] Events (search): ', events.data);

    // 2. Create fake assets

    const assets = events.data.reduce((_assets, event, index, array) => {
      if (!_assets.data.some(asset => asset.assetId === event.content.idData.assetId)) {
        _assets.data.push({
          assetId: event.content.idData.assetId,
          content: {
            idData: {
              createdBy: event.content.idData.createdBy,
            },
          },
        });
      }

      return _assets;
    }, {
        data: [],
        pagination: events.pagination,
      });

    const ids = assets.data.reduce((_ids, asset, index, array) => {
      if (_ids.indexOf(asset.assetId) === -1) {
        _ids.push(asset.assetId);
      }
      return _ids;
    }, []);

    // 3. Get latest info events for final assets

    url = `${this.api.extended}/event/latest/type`;
    body = {
      type: 'ambrosus.asset.info',
      assets: ids,
    };

    const infoEvents = await this.to(this.http.post(url, body));
    if (infoEvents.error) {
      this.messageService.error(infoEvents.error);
      Promise.reject(infoEvents.error);
      return;
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

    this.search = true;
    this.assets = assets;

    Promise.resolve();
  }

  async getAssets(options: {
    limit?: number;
    next?: string;
  } = {}): Promise<any> {
    let { limit, next } = options;
    const account = <any>this.storageService.get('account') || {};
    const { address } = account;
    this.assetsReset = false;
    limit = limit || 15;
    next = next || '';

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
      this.messageService.error(assets.error);
      return;
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
      this.messageService.error(infoEvents.error);
      return;
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

  getAsset(assetId: string): Observable<any> {
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
          if (!assets.data || !Array.isArray(assets.data) || !assets.data.length) {
            return observer.error('No asset');
          }

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
            error => {
              this.messageService.error(error);
              observer.error(error);
            },
          );
        },
        error => {
          this.messageService.error(error);
          observer.error(error);
        },
      );
    });
  }

  async getEvents(options: {
    assetId: string;
    limit?: number;
    next?: string;
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
      this.messageService.error(events.error);
      return;
    }

    this.events = events;
  }

  async getMaxEvents(options: {
    assetId: string;
    limit?: number;
  }): Promise<any> {
    const { assetId, limit } = options;

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
    };

    const events = await this.to(this.http.post(url, body));
    if (events.error) {
      this.messageService.error(events.error);
      throw events.error;
    }
    console.log('[GET] Max events: ', events);

    return events;
  }

  getEvent(eventId: string): Observable<any> {
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

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        (events: any) => {
          if (!events.data || !Array.isArray(events.data) || !events.data.length) {
            return observer.error('No event');
          }

          observer.next(this.parseEvent(events.data[0]));
        },
        error => observer.error('No event'),
      );
    });
  }

  wait() {
    return new Promise(resolve => setTimeout(resolve, 600));
  }

  // Create methods

  async createAsset(asset: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.wait();

        const url = `${this.api.core}/assets`;
        const data = { created: [], errors: [] };

        const assetCreated = await this.to(this.http.post(url, asset));
        if (assetCreated.error) {
          this.progress.status.asset.next({ asset, error: assetCreated.error });
          this.responses[this.responses.length - 1].assets.error.push(assetCreated.error);
          // debug
          console.log('Create asset error: ', assetCreated.error);
          return reject(assetCreated.error);
        }
        this.progress.status.asset.next(assetCreated);
        this.responses[this.responses.length - 1].assets.success.push(assetCreated);

        // debug
        console.log('Create asset success: ', assetCreated);

        data['change'] = 'data';
        data['type'] = 'start';
        data['data'] = [assetCreated];

        this.assets = data;

        resolve(assetCreated);
      } catch (error) {
        reject(error);
      }
    });
  }

  async createEvents(events: any[]): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const data = { created: [], errors: [] };

      try {
        for (const event of events) {
          await this.wait();

          const url = `${this.api.core}/assets/${event.content.idData.assetId}/events`;

          const eventCreated = await this.to(this.http.post(url, event));

          if (eventCreated.error) {
            data.errors.push({ event, error: eventCreated.error });
            this.responses[this.responses.length - 1].events.error.push(eventCreated.error);
            this.progress.status.event.next();
          } else {
            data.created.push(eventCreated);
            this.progress.status.event.next(eventCreated);
            this.responses[this.responses.length - 1].events.success.push(eventCreated);
          }
        }

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
        resolve(options);

        return data;
      } catch (error) {
        reject(error);
        throw error;
      }
    });
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
      [city, country, name].filter(item => !!item).join(', ') || 'No place attached'
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
      if (key === 'location' || key === 'identifiers') {
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
    const account: any = this.storageService.get('account') || {};

    const events = e.reduce((_events, { content, eventId }) => {
      const timestamp = content.idData.timestamp;
      const createdBy = content.idData.createdBy;

      if (content && content.data) {
        content.data.map(obj => {
          const parts = obj.type.split('.');
          const type = parts[parts.length - 1];
          const category = parts[parts.length - 2] || 'asset';
          const namespace = parts[parts.length - 3] || 'ambrosus';
          const ago = moment.tz(timestamp * 1000, account.timeZone || 'UTC').fromNow();

          obj.timestamp = timestamp;
          obj.createdBy = createdBy;
          obj.name = obj.name || type;
          obj.type = type;
          obj.eventId = eventId;
          obj.ago = ago;

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
    return this.web3.eth.accounts.sign(this.serializeForHashing(data), secret).signature;
  }

  calculateHash(data) {
    return this.web3.eth.accounts.hashMessage(this.serializeForHashing(data));
  }

  serializeForHashing(object) {
    const isDict = subject =>
      typeof subject === 'object' && !Array.isArray(subject);
    const isstring = subject => typeof subject === 'string';
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
    } else if (isstring(object)) {
      return `"${object}"`;
    }

    return object.toString();
  }

  validTimestamp(timestamp) {
    return new Date(timestamp).getTime() > 0;
  }

  isLatest(type) {
    return (['info', 'redirection', 'identifiers', 'branding', 'location'].indexOf(type) === -1);
  }

  findEvent(eventType, events) {
    let e = false;
    events.map(event => {
      if (event.content.data) {
        event.content.data.map(obj => {
          const type = obj.type.split('.');
          obj.type = type[type.length - 1];
          obj.type = obj.type.toLowerCase();

          if (obj.type === 'location' || obj.type === 'identifiers') {
            event.content.data.map(_obj => {
              if (['location', 'identifiers'].indexOf(_obj.type) === -1) {
                _obj[obj.type === 'location' ? 'location' : 'identifiers'] = obj;
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

          return obj;
        });
      }

      return event;
    });

    return e;
  }
}
