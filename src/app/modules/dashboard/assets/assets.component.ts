import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetsComponent implements OnInit, OnDestroy {
  assets: any;
  noEvents = false;
  error = false;
  selectAllText = 'Select all';
  refreshText = 'Refresh';
  // Create events toggle
  createEvents = false;
  // Subs
  assetSub: Subscription;
  refreshSub: Subscription;

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
    this.assetSub = this.assetsService.getAssets().subscribe(
      (resp: any) => {
        this.assets = resp;
        if (resp.resultCount === 0) {
          this.noEvents = true;
        }
        console.log(resp);
      },
      error => {
        console.log(error);
        this.error = true;
      }
    );
  }

  refresh() {
    this.refreshText = 'Refreshing...';
    this.refreshSub = this.assetsService.getAssets().subscribe(
      (resp: any) => {
        this.assets = resp;
        if (resp.resultCount === 0) {
          this.noEvents = true;
        }
        setTimeout(() => (this.refreshText = 'Refresh'), 500);
      },
      error => {
        console.log(error);
        this.error = true;
        setTimeout(() => (this.refreshText = 'Refresh'), 500);
      }
    );
  }

  ngOnDestroy() {
    this.assetSub.unsubscribe();
    // this.refreshSub.unsubscribe();
  }

  onSelectAll(e, input) {
    const assetsList = this.el.nativeElement.querySelector('#assets-list');
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
