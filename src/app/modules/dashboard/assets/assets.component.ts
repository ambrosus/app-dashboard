import {Component, ElementRef, Input, OnInit, Renderer2, ViewEncapsulation} from '@angular/core';
import {DataStorageService} from '../../../services/data-storage.service';
import {SelectedAssetsService} from '../../../services/selected-assets.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetsComponent implements OnInit {
  getAssetsError: boolean = false;
  assetsLoaded: boolean = false;
  assets: any;

  constructor(private dataStorage: DataStorageService,
              private selectedAssets: SelectedAssetsService,
              private el: ElementRef,
              private renderer: Renderer2) { }

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

  onSelectAll(e, input) {
    const assetsList = this.el.nativeElement.querySelector('.assets-list');
    if (input.checked) {
      for (const asset of assetsList.children) {
        const checkbox = asset.children[0].children[0];
        checkbox.checked = true;
        this.selectedAssets.selectAsset(checkbox.name);
      }
      this.selectedAssets.toggleSelect.next('true');
    } else {
      for (const asset of assetsList.children) {
        const checkbox = asset.children[0].children[0];
        checkbox.checked = false;
      }
      this.selectedAssets.unselectAssets();
      this.selectedAssets.toggleSelect.next('true');
    }
    console.log(this.selectedAssets.getAssets());
  }

}
