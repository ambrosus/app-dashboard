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
  // Create events toggle
  createEvents = false;
  // Subs
  assetSub: Subscription;

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

  sort(by, element: ElementRef) {
    // use by to make an API call
    // if success asc or des add class
    this.renderer.removeClass(element, 'asc');
    this.renderer.removeClass(element, 'des');
    // Add sort appropirate class
    this.renderer.addClass(element, 'asc');
  }

  ngOnInit() {
    this.assetSub = this.assetsService.getAssets().subscribe(
      (resp: any) => {
        this.assets = '';
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

  ngOnDestroy() {
    this.assetSub.unsubscribe();
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
  }
}
