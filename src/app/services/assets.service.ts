import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as AmbrosusSDK from 'ambrosus-javascript-sdk';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

declare let Web3: any;

@Injectable()
export class AssetsService {
  inputChanged = new Subject();
  _events: BehaviorSubject<any> = new BehaviorSubject({ results: [] });
  _assets: BehaviorSubject<any> = new BehaviorSubject({ results: [] });
  ambrosus;
  web3;

  constructor(
    private storageService: StorageService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initSDK();
    this.web3 = new Web3();
  }

  get assets() { return this._assets.asObservable(); }
  get events() { return this._events.asObservable(); }

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
        ({ data }: any) => this._assets.next(data),
        err => observer.error(err.error),
      );
    });
  }

  getAsset(assetId) {
    return new Observable(observer => {
      const token = this.authService.getToken();
      const url = `/api/assets/${assetId}?token=${token}`;

      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error),
      );
    });
  }

  getEvents(options) {
    return new Observable(observer => {
      let url = `/api/assets/events?`;
      Object.keys(options).map(key => url += `${key}=${options[key]}&`);

      this.http.get(url).subscribe(
        ({ data }: any) => { console.log(data); this._events.next(data); },
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
      const url = `/api/assets`;
      const body = { assets, events };

      this.http.post(url, body).subscribe(
        ({ data }: any) => observer.next(data),
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
          this._events.next({ results: [...this._events.getValue().results].concat(data.events.created) });
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

  parseTimelineEvents(e) {
    const events = e.results.reduce((_events, { content, eventId }) => {
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
}
