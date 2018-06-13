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
  assets: {};
  inputChanged = new Subject();
  ambrosus;
  // credentials
  secret;
  address;

  constructor(private http: HttpClient, private storage: StorageService) {
    this.secret = this.storage.get('secret');
    this.address = this.storage.get('address');
    const apiEndpoint = 'https://gateway-dev.ambrosus.com';

    this.ambrosus = new AmbrosusSDK({
      apiEndpoint: apiEndpoint,
      secret: this.secret,
      address: this.address
    });
  }

  // Only one without SDK for now
  getAssets() {
    const url = `${environment.apiUrls.assets}?createdBy=${this.storage.get(
      'address'
    )}`;
    return new Observable(observer => {
      this.http.get(url).subscribe(
        (resp: any) => {
          this.assets = resp;
          const assetsCopy = Object.assign({}, this.assets);
          return observer.next(assetsCopy);
        },
        (err: any) => {
          console.log('err ', err);
          return observer.error(err);
        }
      );
    });
  }

  createAsset() {
    return new Observable(observer => {
      this.ambrosus
        .createAsset([])
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
