import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as AmbrosusSDK from 'ambrosus-javascript-sdk';
import { AuthService } from './auth.service';

declare let Web3: any;

@Injectable()
export class AssetsService {
  hermes;



  assetsSelected: string[] = [];
  toggleSelect: Subject<any> = new Subject();
  inputChanged = new Subject();
  assets: {};
  ambrosus;
  currentAssetId: string;
  asset;
  eventAdded = new Subject();
  eventAddFailed = new Subject();
  addEventsJSON;
  addAssetAndInfoEventJSON;
  editInfoEventJSON;
  infoEventCreated = new Subject();
  infoEventFailed = new Subject();

  constructor(private storage: StorageService, private http: HttpClient, private auth: AuthService) {
    this.initSDK();
    window.addEventListener('user:refresh', () => this.initSDK());
  }

  initSDK() {
    this.hermes = <any>this.storage.get('hermes') || <any>{};
    const secret = this.storage.get('secret');
    const token = this.storage.get('token');

    this.ambrosus = new AmbrosusSDK({
      apiEndpoint: this.hermes.url,
      secret,
      Web3,
      headers: {
        Authorization: `AMB_TOKEN ${token}`
      }
    });
  }

  getAssets(options) {
    return new Observable(observer => {
      let url = `/api/assets?`;
      Object.keys(options).map(key => url += `${key}=${options[key]}&`);

      this.http.get(url).subscribe(
        resp => observer.next(resp),
        err => observer.error(err)
      );
    });
  }

  getEvents(options) {
    return new Observable(observer => {
      let url = `/api/assets/events?`;
      Object.keys(options).map(key => url += `${key}=${encodeURI(options[key])}&`);

      this.http.get(url).subscribe(
        resp => observer.next(resp),
        err => observer.error(err)
      );
    });
  }

  getAsset(assetId) {
    return new Observable(observer => {
      const url = `/api/assets/${assetId}`;

      this.http.get(url).subscribe(
        resp => observer.next(resp),
        err => observer.error(err)
      );
    });
  }

  getEvent(eventId) {
    return new Observable(observer => {
      const token = this.auth.getToken();
      const url = `/api/assets/events/${eventId}?token=${token}`;

      this.http.get(url).subscribe(
        resp => observer.next(resp),
        err => observer.error(err)
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
              if (_event.type !== 'location') {
                _event.location = location;
              }
            }, obj);
          }

          const notInclude = ['location', 'identifier', 'identifiers'];
          if (notInclude.indexOf(obj.type) === -1) {
            _events.events.push(obj);
          }

          return obj;
        });
      }
      return _events;
    }, { events: [], resultCount: e.resultCount });

    events.events.sort(this.sortEventsByTimestamp);

    return events;
  }






  // CREATE asset and events

  createAsset(data) {
    return new Observable(observer => {
      this.ambrosus
        .createAsset(data)
        .then(function (resp) {
          return observer.next(resp);
        })
        .catch(function (error) {
          return observer.error(error);
        });
    });
  }

  createEvent(assetId, event) {
    return new Promise((resolve, reject) => {
      this.ambrosus
        .createEvent(assetId, event)
        .then(function (resp) {
          resolve(resp);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  // Events add
  addEvents() {
    const selectedAssets = this.getSelectedAssets();
    selectedAssets.map((assetId) => {
      this.addEventsJSON.content.idData.assetId = assetId;
      this.addEventsJSON.content.idData.createdBy = <any>this.storage.get('user')['address'];
      this.createEvent(assetId, this.addEventsJSON).then(resp => {
        this.eventAdded.next(resp);
      }).catch(err => {
        console.log('Event add failed for asset: ', assetId);
        this.eventAddFailed.next(err);
      });
    });
    this.addEventsJSON = {};
  }

  // For asset creation
  addAssetAndInfoEvent() {
    this.createAsset([]).subscribe(
      (resp: any) => {
        console.log('Asset creation successful ', resp);
        const assetId = resp.data.assetId;
        this.addAssetAndInfoEventJSON.content.idData.assetId = assetId;
        this.addAssetAndInfoEventJSON.content.idData.createdBy = <any>this.storage.get('user')['address'];
        this.createEvent(assetId, this.addAssetAndInfoEventJSON).then(response => {
          console.log('Assets event creation successful ', response);
          this.infoEventCreated.next(response);
        }).catch(error => {
          console.log('Assets event creation failed ', error);
          this.infoEventFailed.next(error);
        });
      },
      err => {
        console.log('Asset creation failed ', err);
        this.infoEventFailed.next(err);
      }
    );
  }

  // Only info event editing
  editInfoEvent() {
    const assetId = this.getSelectedAssets()[0];
    this.editInfoEventJSON.content.idData.assetId = assetId;
    this.editInfoEventJSON.content.idData.createdBy = <any>this.storage.get('user')['address'];
    console.log('editInfoEvent', this.editInfoEventJSON);
    this.createEvent(assetId, this.editInfoEventJSON).then(resp => {
      console.log('Info event creation/edit successful ', resp);
      this.infoEventCreated.next(resp);
    }).catch(err => {
      console.log('Info event creation/edit failed ', err);
      this.infoEventFailed.next(err);
    });
  }

  // assetId selection service
  selectAsset(assetId: string) {
    this.assetsSelected.push(assetId);
  }

  unselectAsset(assetId: string) {
    const index = this.assetsSelected.indexOf(assetId);
    if (index > -1) {
      this.assetsSelected.splice(index, 1);
    }
  }

  unselectAssets() {
    this.assetsSelected = [];
  }

  getSelectedAssets() {
    // return [...new Set(this.assets)];
    return Array.from(new Set(this.assetsSelected));
  }
}
