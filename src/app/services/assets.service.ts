import { StorageService } from 'app/services/storage.service';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

declare let AmbrosusSDK: any;

@Injectable({
  providedIn: 'root'
})
export class AssetsService {
  assetsSelected: string[] = [];
  toggleSelect: Subject<any> = new Subject();
  inputChanged = new Subject();
  assets: {};
  // SDK
  ambrosus;
  secret;
  address;
  // Parsing get asset/event
  currentAssetId: string;
  asset;

  constructor(private http: HttpClient, private storage: StorageService) {
    this.secret = this.storage.get('secret');
    this.address = this.storage.get('address');
    const apiEndpoint = 'https://gateway-test.ambrosus.com';

    this.ambrosus = new AmbrosusSDK({
      apiEndpoint: apiEndpoint,
      secret: this.secret,
      address: this.address
    });
  }

  isValidURL(str) {
    const a = document.createElement('a');
    a.href = str;
    return a.host && a.host !== window.location.host;
  }

  sortEventsByTimestamp(a, b) {
    if (a[1].timestamp > b[1].timestamp) {
      return -1;
    }
    if (a[1].timestamp < b[1].timestamp) {
      return 1;
    }
    return 0;
  }

  // GET asset and GET event

  getAsset(assetId) {
    return new Observable(observer => {
      if (this.currentAssetId && this.currentAssetId === assetId) {
        return observer.next(this.asset);
      }

      this.getAssetDetails(assetId).then(response => {
        this.getEvents(assetId).then(eventsArray => {
          this.parseEvents(eventsArray).then(parsedData => {
            this.asset = parsedData;
            return observer.next(this.handleRedirection(assetId));
          });
        });
      });
    });
  }

  getAssetDetails(assetId) {
    return new Promise((resolve, reject) => {
      this.ambrosus
        .getAssetById(assetId)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  getEvents(assetId) {
    return new Promise((resolve, reject) => {
      this.ambrosus
        .getEvents({ assetId: assetId })
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  parseEvents(eventsArray) {
    return new Promise((resolve, reject) => {
      this.ambrosus
        .parseEvents(eventsArray)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }

  handleRedirection(assetId) {
    this.asset.events = Object.entries(this.asset.events)
      .sort(this.sortEventsByTimestamp)
      .reduce((array: any, event) => array.concat(event[1]), []);

    if (
      this.asset.redirection &&
      this.isValidURL(this.asset.redirection.targetUrl)
    ) {
      // window.location.replace(this.asset.redirection.targetUrl);
      // return false;
    } else {
      delete this.asset.redirection;
    }

    return this.asset;
  }

  getEventById(eventId) {
    return new Observable(observer => {
      this.asset.events.some(e => {
        if (e.eventId === eventId) {
          observer.next(e);
          return true;
        }
      });
    });
  }

  // GET assets

  getAssets() {
    let cachedAssets;
    try {
      cachedAssets = JSON.parse(this.storage.get('assets')) || null;
    } catch (e) {
      cachedAssets = null;
    }
    const that = this;
    const params = {
      createdBy: this.address
    };

    return new Observable(observer => {
      if (cachedAssets) {
        observer.next(cachedAssets);
      }

      this.ambrosus
        .getAssets(params)
        .then(function(resp) {
          // Caching assets in the storage
          const _assets = JSON.stringify(resp.data);
          that.storage.set('assets', _assets);

          return observer.next(resp.data);
        })
        .catch(function(error) {
          console.log('Get assets error: ', error);
          return observer.error(error);
        });
    });
  }

  // CREATE asset and events

  createAsset(data) {
    return new Observable(observer => {
      this.ambrosus
        .createAsset(data)
        .then(function(resp) {
          return observer.next(resp);
        })
        .catch(function(error) {
          return observer.error(error);
        });
    });
  }

  createEvent(assetId, event) {
    return new Observable(observer => {
      this.ambrosus
        .createEvent(assetId, event)
        .then(function(resp) {
          return observer.next(resp);
        })
        .catch(function(error) {
          return observer.error(error);
        });
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
