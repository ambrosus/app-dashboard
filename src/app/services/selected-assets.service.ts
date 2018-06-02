import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedAssetsService {
  assets: string[] = [];
  toggleSelect: Subject<any> = new Subject();

  constructor() {
  }

  selectAsset(assetId: string) {
    this.assets.push(assetId);
  }

  unselectAsset(assetId: string) {
    const index = this.assets.indexOf(assetId);
    if (index > -1) {
      this.assets.splice(index, 1);
    }
  }

  unselectAssets() {
    this.assets = [];
  }

  getAssets() {
    // return [...new Set(this.assets)];
    return Array.from(new Set(this.assets));
  }
}
