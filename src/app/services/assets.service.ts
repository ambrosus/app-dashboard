import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssetsService {
  assetsSelected: string[] = [];
  toggleSelect: Subject<any> = new Subject();
  getAssetsSuccess: Subject<any> = new Subject();
  getAssetsError: Subject<any> = new Subject();
  assets: {};
  inputChanged = new Subject();

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get(`${environment.apiUrls.assets}`).
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
