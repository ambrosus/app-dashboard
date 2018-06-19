import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { AssetsService } from 'app/services/assets.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetsComponent implements OnInit {
  assets: any;
  noEvents = false;
  error = false;
  selectAllText = 'Select all';
  // Create events toggle
  createEvents = false;

  constructor(
    private assetsService: AssetsService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  openCreateEvents() {
    if (this.assetsService.getSelectedAssets().length === 0) {
      alert(`You didn\'t select any assets. Please do so first.`);
      return;
    }
    this.createEvents = true;
  }

  ngOnInit() {
    this.assetsService.getAssets().subscribe(
      (resp: any) => {
        console.log(resp);
        this.assets = resp;
        if (resp.resultCount === 0) {
          this.noEvents = true;
        }
      },
      error => {
        console.log(error);
        this.error = true;
      }
    );
  }

  onSelectAll(e, input) {
    const assetsList = this.el.nativeElement.querySelector('.assets-list');
    if (input.checked) {
      this.selectAllText = 'Unselect all';
      for (const asset of assetsList.children) {
        const checkbox = asset.children[0].children[0];
        checkbox.checked = true;
        this.assetsService.selectAsset(checkbox.name);
      }
      this.assetsService.toggleSelect.next('true');
    } else {
      this.selectAllText = 'Select all';
      for (const asset of assetsList.children) {
        const checkbox = asset.children[0].children[0];
        checkbox.checked = false;
      }
      this.assetsService.unselectAssets();
      this.assetsService.toggleSelect.next('true');
    }
    console.log(this.assetsService.getSelectedAssets());
  }
}
