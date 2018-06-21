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

  constructor(private http: HttpClient, private storage: StorageService) {
    this.secret = this.storage.get('secret');
    this.address = this.storage.get('address');
    const apiEndpoint =
      this.storage.environment === 'dev'
        ? 'https://gateway-dev.ambrosus.com'
        : 'https://gateway-test.ambrosus.com';

    this.ambrosus = new AmbrosusSDK({
      apiEndpoint: apiEndpoint,
      secret: this.secret,
      address: this.address
    });
  }

  // Only one without SDK for now
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
