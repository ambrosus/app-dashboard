import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataStorageService} from '../../../services/data-storage.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit, OnDestroy {
  getAssetsError: boolean = false;
  assetsLoaded: boolean = false;
  assets: {};

  constructor(private dataStorage: DataStorageService) { }

  ngOnInit() {
    this.dataStorage.getAssets();
    this.dataStorage.getAssetsSuccess.subscribe(
      (resp: any) => {
        this.assetsLoaded = true;
        this.getAssetsError = false;
        this.assets = resp;
      }
    );
    this.dataStorage.getAssetsError.subscribe(
      (resp: any) => {
        this.getAssetsError = true;
      }
    );
  }

  ngOnDestroy() {
    this.dataStorage.getAssetsSuccess.unsubscribe();
    this.dataStorage.getAssetsError.unsubscribe();
  }

}
