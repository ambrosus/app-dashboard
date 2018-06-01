import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedAssetsService {
  assets: any[];
  toggleSelect: Subject<any> = new Subject();

  constructor() { }

  selectAssets(assetsIds: any[]) {
    this.assets = assetsIds;
  }

  unselectAssets() {
    this.assets = [];
  }
}
