import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  getAssetsSuccess: Subject<any> = new Subject();
  getAssetsError: Subject<any> = new Subject();
  assets: {};

  constructor(private http: HttpClient) { }

  getAssets() {
    return this.http.get(`https://gateway-dev.ambrosus.com/assets`).
      subscribe(
      (resp: any) => {
        this.assets = resp;
        const assetsCopy = Object.assign({}, this.assets);
        this.getAssetsSuccess.next(assetsCopy);
      },
      (err: any) => {
        this.getAssetsError.next('Error');
        console.log('err ', err);
      }
    );
  }
}
