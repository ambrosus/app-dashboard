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
  _events: BehaviorSubject<any> = new BehaviorSubject({ results: [], resultCount: 0 });
  hermes;
  ambrosus;
  web3;

  constructor(private storage: StorageService, private http: HttpClient, private auth: AuthService, private router: Router) {
    this.initSDK();
    this.web3 = new Web3();
    window.addEventListener('user:refresh', () => this.initSDK());
  }

  get events() { return this._events.asObservable(); }

  emit(type) { window.dispatchEvent(new Event(type)); }

  initSDK() {
    this.hermes = <any>this.storage.get('hermes') || <any>{};
    const secret = this.storage.get('secret');
    const token = this.storage.get('token');

    this.ambrosus = new AmbrosusSDK({
      apiEndpoint: this.hermes.url,
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
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  getEvents(options) {
    return new Observable(observer => {
      let url = `/api/assets/events?`;
      Object.keys(options).map(key => url += `${key}=${encodeURI(options[key])}&`);
      console.log(url);

      this.http.get(url).subscribe(
        ({ data }: any) => {
          console.log(data);
          this._events.next(data);
          observer.next(data);
        },
        err => observer.error(err.error)
      );
    });
  }

  getAsset(assetId) {
    return new Observable(observer => {
      const token = this.auth.getToken();
      const url = `/api/assets/${assetId}?token=${token}`;

      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  getEvent(eventId) {
    return new Observable(observer => {
      const token = this.auth.getToken();
      const url = `/api/assets/events/${eventId}?token=${token}`;

      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  sortEventsByTimestamp(a, b) {
    if (a.timestamp > b.timestamp) { return -1; }
    if (a.timestamp < b.timestamp) { return 1; }
    return 0;
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
          if (notInclude.indexOf(obj.type) === -1) { _events.events.push(obj); }

          return obj;
        });
      }
      return _events;
    }, { events: [], resultCount: e.resultCount });

    events.events.sort(this.sortEventsByTimestamp);

    return events;
  }

  // Create methods

  createAssets(assets, events) {
    return new Observable(observer => {
      const token = this.auth.getToken();
      const url = `/api/assets?token=${token}`;
      const body = { assets, events };

      this.http.post(url, body).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  createEvents(events) {
    return new Observable(observer => {
      const token = this.auth.getToken();
      const url = `/api/assets/events?token=${token}`;
      const body = { events };

      this.http.post(url, body).subscribe(
        ({ data }: any) => {
          console.log(data);
          this._events.next({ results: [...this._events.getValue().results].concat(data.events) });
          const u = `/assets/${data.events[0].content.idData.assetId}/events/${data.events[0].eventId}`;
          if (location.pathname.includes('/events/')) { this.router.navigate([u]); }
          observer.next(data);
        },
        err => observer.error(err.error)
      );
    });
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
