import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as AmbrosusSDK from 'ambrosus-javascript-sdk';
import { AuthService } from './auth.service';

declare let Web3: any;

@Injectable()
export class AssetsService {
  inputChanged = new Subject();
  private _events: BehaviorSubject<any> = new BehaviorSubject({ meta: {}, data: [], pagination: {} });
  private _assets: BehaviorSubject<any> = new BehaviorSubject({ meta: {}, data: [], pagination: {} });
  ambrosus;
  web3;

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.initSDK();
    this.web3 = new Web3();
    this.loadAssets();
  }

  loadAssets() {
    const token = this.authService.getToken();
    const user = <any>this.storageService.get('user') || {};
    const { address } = user;
    const options = {
      limit: 15,
      token,
      address,
    };
    this.getAssets(options).subscribe();
  }

  get assets(): any { return this._assets.asObservable(); }
  get events(): any { return this._events.asObservable(); }

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
            options.data.map(event => assets.data.unshift(event));
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

  getAssets(options) {
    return new Observable(observer => {
      let url = `/api/assets?`;
      Object.keys(options).map(key => url += `${key}=${options[key]}&`);

      this.http.get(url).subscribe(
        ({ data }: any) => this.assets = data,
        err => observer.error(err.error),
      );
    });
  }

  getAsset(assetId) {
    return new Observable(observer => {
      const token = this.authService.getToken();
      const url = `/api/assets/${assetId}?token=${token}`;

      this.http.get(url).subscribe(
        ({ data }: any) => {
          this.parseAsset(data.results[0]);
          observer.next(data);
        },
        err => observer.error(err.error),
      );
    });
  }

  getEvents(options) {
    return new Observable(observer => {
      let url = `/api/assets/events?`;
      Object.keys(options).map(key => url += `${key}=${options[key]}&`);

      this.http.get(url).subscribe(
        ({ data }: any) => this.events = data,
        err => observer.error(err.error),
      );
    });
  }

  getEvent(eventId) {
    return new Observable(observer => {
      const token = this.authService.getToken();
      const url = `/api/assets/events/${eventId}?token=${token}`;

      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error),
      );
    });
  }

  // Create methods

  createAssets(assets, events) {
    return new Observable(observer => {
      const token = this.authService.getToken();
      const url = `/api/assets`;
      const body = { assets, events, token };

      this.http.post(url, body).subscribe(
        ({ data }: any) => {
          data['change'] = 'data';
          data['type'] = 'start';
          data['data'] = data.assets.created;
          this.assets = data;
          observer.next(data);
        },
        err => observer.error(err.error),
      );
    });
  }

  createEvents(events) {
    return new Observable(observer => {
      const url = `/api/assets/events`;
      const body = { events };

      this.http.post(url, body).subscribe(
        ({ data }: any) => {
          // Update _events
          const eventsData = this._events.getValue().data;
          if (eventsData && eventsData.length) {
            data['change'] = 'data';
            data['type'] = 'start';
            data['data'] = data.events.created;
            this.events = data;
          }

          // Update _assets
          let assetsData = this._assets.getValue().data;
          assetsData = assetsData.map(asset => {
            const assetEvents = data.events.created.filter(event => asset.assetId === event.content.idData.assetId);
            const infoEvent = this.findEvent('info', assetEvents);
            if (infoEvent) { asset['infoEvent'] = infoEvent; }
            return asset;
          });
          const options = { change: 'data', type: 'all', data: assetsData };
          this.assets = options;

          observer.next(data);
        },
        err => observer.error(err.error),
      );
    });
  }

  // UTILS

  getName(obj, alternative = 'No title') {
    try {
      const name = obj.name;
      let type = obj.type.split('.');
      type = type[type.length - 1];
      return [name, type].find(i => i);
    } catch (e) { return alternative; }
  }

  getImage(obj) {
    try {
      return obj.images.default.url;
    } catch (e) { return '/assets/raster/logotip.jpg'; }
  }

  getLocation(event) {
    const location = event.location || event;
    const { city, country, name } = location;
    return [city, country, name].filter(Boolean).join(', ') || 'No place attached';
  }

  sortEventsByTimestamp(a, b) {
    if (a.timestamp > b.timestamp) { return -1; }
    if (a.timestamp < b.timestamp) { return 1; }
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
        } else { total.push(obj); }

        return total;
      }, []);

      // Groups and properties
      eventObjects.map(eventObject => {
        eventObject['groups'] = [];
        eventObject['properties'] = [];
        Object.keys(eventObject).map((key: any) => {
          if (['type', 'name', 'assetType', 'documents', 'images', 'eventId', 'createdBy', 'timestamp', 'location', 'identifiers', 'groups', 'properties'].indexOf(key) === -1) {
            const property = {
              key,
              value: eventObject[key],
            };
            eventObject[typeof property.value === 'string' || Array.isArray(property.value) ? 'properties' : 'groups'].push(property);
          }
        });
      });
    }

    return eventObjects;
  }

  parseAsset(asset) {
    if (!asset.infoEvent) { asset.infoEvent = {}; }
    // Groups and properties
    asset.infoEvent['groups'] = [];
    asset.infoEvent['properties'] = [];
    Object.keys(asset.infoEvent).map((key: any) => {
      if (['type', 'name', 'assetType', 'images', 'eventId', 'createdBy', 'timestamp', 'location', 'identifiers', 'groups', 'properties'].indexOf(key) === -1) {
        const property = {
          key,
          value: asset.infoEvent[key],
        };
        asset.infoEvent[typeof property.value === 'string' || Array.isArray(property.value) ? 'properties' : 'groups'].push(property);
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
              if (_event.type !== 'location') { _event.location = location; }
            }, obj);
          }

          const notInclude = ['location', 'identifier', 'identifiers'];
          if (notInclude.indexOf(obj.type) === -1) { _events.push(obj); }

          return obj;
        });
      }
      return _events;
    }, []);

    events.sort(this.sortEventsByTimestamp);

    return events;
  }

  sign(data, secret) { return this.web3.eth.accounts.sign(this.serializeForHashing(data), secret).signature; }

  calculateHash(data) { return this.web3.eth.accounts.hashMessage(this.serializeForHashing(data)); }

  serializeForHashing(object) {
    const isDict = subject => typeof subject === 'object' && !Array.isArray(subject);
    const isString = subject => typeof subject === 'string';
    const isArray = subject => Array.isArray(subject);

    if (isDict(object)) {
      const content = Object.keys(object).sort().map(key => `"${key}":${this.serializeForHashing(object[key])}`).join(',');
      return `{${content}}`;
    } else if (isArray(object)) {
      const content = object.map(item => this.serializeForHashing(item)).join(',');
      return `[${content}]`;
    } else if (isString(object)) { return `"${object}"`; }

    return object.toString();
  }

  validTimestamp(timestamp) { return new Date(timestamp).getTime() > 0; }

  isLatest(type) { return ['info', 'redirection', 'identifiers', 'branding', 'location'].indexOf(type) === -1; }

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
                _obj[obj.type === 'location' ? 'location' : 'identifiers'] = obj;
              }
            });
          }

          switch (eventType) {
            case 'latest':
              if (this.isLatest(obj.type)) { e = obj; }
              break;
            default:
              if (obj.type === eventType) { e = obj; }
          }
        });
      }
    });
    return e;
  }
}
