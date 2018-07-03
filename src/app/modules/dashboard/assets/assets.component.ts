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
  searchPlaceholder = 'ie. Green apple';
  searchResults;
  searchNoResults = false;

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
    this.searchPlaceholder = 'ie. Green apple';
    if (search.length < 1) {
      this.searchPlaceholder = 'Please type something first';
      return;
    }

    this.searchButtonText = 'Searching...';
    const searchValues = search.split(',');
    let queries = [];
    switch (select) {
      case 'name':
        queries.push({
          param: 'data[name]',
          value: searchValues[0].trim()
        });
        break;
      case 'createdBy':
        queries.push({
          param: 'createdBy',
          value: searchValues[0].trim()
        });
        break;
      case 'type':
        queries.push({
          param: 'data[type]',
          value: `ambrosus.asset.${searchValues[0].trim()}`
        });
        break;
      case 'asset identifiers':
        queries.push({
          param: 'data[type]',
          value: 'ambrosus.asset.identifiers'
        });
        queries = searchValues.reduce((_queries, query) => {
          const ide = query.split(':');
          const _query = {
            param: `data[identifiers.${ide[0].trim()}]`,
            value: ide[1].trim()
          }
          _queries.push(_query);

          return _queries;
        }, queries);
        break;
      case 'event identifiers':
        queries.push({
          param: 'data[type]',
          value: 'ambrosus.event.identifiers'
        });
        queries = searchValues.reduce((_queries, query) => {
          const ide = query.split(':');
          const _query = {
            param: `data[identifiers.${ide[0].trim()}]`,
            value: ide[1].trim()
          }
          _queries.push(_query);

          return _queries;
        }, queries);
        break;
    }

    // Make a request here
    this.searchResults = null;
    this.assetsService.searchEvents(queries).then((resp: any) => {
      if (resp.length > 1) {
        this.searchResults = resp;
        console.log(this.searchResults);
      } else {
        this.searchNoResults = true;
        setTimeout(() => {
          this.searchNoResults = false;
        }, 2500);
      }
    }).catch(err => {
      console.log(err);
    });
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
