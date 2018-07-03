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
import { ActivatedRoute } from '@angular/router';

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
  // Search
  searchButtonText = 'Search';
  searchMessage = 'ie. Green apple';

  constructor(
    private assetsService: AssetsService,
    private el: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute
  ) {}

  openCreateEvents() {
    if (this.assetsService.getSelectedAssets().length === 0) {
      alert(`You didn\'t select any assets. Please do so first.`);
      return;
    }
    this.createEvents = true;
  }

  ngOnInit() {
    this.assetSub = this.route.data.subscribe(
      data => {
        this.assets = data.assets;
        console.log(this.assets);
      },
      err => {
        console.log('Error getting assets: ', err);
      }
    );
  }

  ngOnDestroy() {
    this.assetSub.unsubscribe();
  }

  search() {
    const search = this.el.nativeElement.querySelector('#search').value;
    const select = this.el.nativeElement.querySelector('#select').value;
    this.searchMessage = 'ie. Green apple';
    if (search.length < 1) {
      this.searchMessage = 'Please type something first';
      return;
    }

    this.searchButtonText = 'Searching...';
    const searchValues = search.split(',');
    const value = {
      values: searchValues.map((entry) => entry.trim()),
      searchBy: select
    };

    // Make a request here
    console.log(value);
    setTimeout(() => {
      this.searchButtonText = 'Search';
    }, 500);
  }

  findInfo(info) {
    return info.content.data.find((obj) => obj.type === 'ambrosus.asset.info');
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
