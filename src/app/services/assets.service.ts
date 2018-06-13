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
  getEventsInfoSuccess: Subject<any> = new Subject();
  getEventsInfoError: Subject<any> = new Subject();
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

  // API POST: create asset
  createAsset() {
    const params = {
      content: {
        idData: {
          createdBy: this.storage.get('address'),
          timestamp: new Date().getTime() / 1000,
          sequenceNumber: 3
        }
      }
    };
    return this.http.post(environment.apiUrls.createAsset, params);
  }

  // API POST: create event
  createEvent(body, assetId: string) {
    const params = body;
    return this.http.post(
      `${environment.apiUrls.createEvent}${assetId}/events`,
      params
    );
  }

  getEventsInfo() {
    return new Observable(observer => {
      const params = {
        createdBy: this.address,
        'data[type]': 'ambrosus.event.location'
      };
      this.ambrosus
        .getEvents(params)
        .then(function(resp) {
          console.log(resp);
        })
        .catch(function(error) {
          // Error if error
          console.log(error);
        });
    });
  }

  /* getAssets() {
    const url = `${environment.apiUrls.assets}?createdBy=${this.storage.get(
      'address'
    )}`;
    return this.http.get(url).subscribe(
      (resp: any) => {
        this.assets = resp;
        const assetsCopy = Object.assign({}, this.assets);
        this.getEventsInfoSuccess.next(assetsCopy);
      },
      (err: any) => {
        this.getEventsInfoError.next('error');
        console.log('err ', err);
      }
    );
  } */

  /* getEventsInfo() {
    const url = `${environment.apiUrls.getEvents}?createdBy=${this.storage.get(
      'address'
    )}&data=data%5Btype%5D%3Dambrosus.asset.info`;
    return this.http.get(url).subscribe(
      (resp: any) => {
        this.assets = resp;
        const assetsCopy = Object.assign({}, this.assets);
        this.getEventsInfoSuccess.next(assetsCopy);
      },
      (err: any) => {
        this.getEventsInfoError.next('error');
        console.log('err ', err);
      }
    );
  } */

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
