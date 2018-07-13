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
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetsComponent implements OnInit, OnDestroy {
  navigationSubscription;
  assets = {
    assets: [],
    resultCount: 0
  };
  accounts = [];
  accountSelected;
  perPage = 15;
  noEvents = false;
  error = false;
  selectAllText = 'Select all';
  loader = false;
  // Create events toggle
  createEvents = false;
  // Subs
  assetSub: Subscription;
  // Search
  searchPlaceholder = 'ie. Green apple';
  searchResultsFound;
  searchNoResultsFound;
  searchResults;
  // Pagination
  currentAssetPage = 1;
  totalAssetPages = 0;
  resultCountAsset = 0;
  currentSearchPage = 1;
  totalSearchPages = 0;
  resultCountSearch = 0;
  assetsActive = true;
  searchActive = false;
  pagination = [];

  constructor(
    private assetsService: AssetsService,
    private el: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private auth: AuthService
  ) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.pageLoad();
      }
    });
  }

  pageLoad() {
    this.loadAssets();
    this.el.nativeElement.querySelector('#search').value = '';
  }

  openCreateEvents() {
    if (this.assetsService.getSelectedAssets().length === 0) {
      alert(`You didn\'t select any assets. Please do so first.`);
      return;
    }
    this.createEvents = true;
  }

  ngOnInit() {
    this.auth.accounts().subscribe(
      (resp: any) => {
        const _address = this.storage.get('address');
        if (!resp.data.some((account) => account.address === _address)) {
          this.accounts = [
            {
              full_name: this.storage.get('email') || 'my account',
              address: _address
            }
          ];
          this.accountSelected = this.accounts[0].address;
        } else {
          this.accounts = resp.data;
          // Loggedin user always default
          this.accounts.map((account, index) => {
            if (account.address === _address) {
              this.accounts.splice(index, 1);
              this.accounts.unshift(account);
              this.accountSelected = account.address;
            }
          });
        }
      },
      err => {
        this.accounts = [
          {
            full_name: this.storage.get('email') || 'my account',
            address: this.storage.get('address')
          }
        ];
        this.accountSelected = this.accounts[0].address;
      }
    );
  }

  account(acc) {
    this.currentAssetPage = 0;
    this.currentSearchPage = 0;
    this.accountSelected = acc.value;
    if (this.assetsActive) {
      this.loadAssets(this.currentAssetPage, this.perPage);
    } else {
      this.search(this.currentSearchPage, this.perPage);
    }
  }

  ngOnDestroy() {
    this.assetSub.unsubscribe();
    this.navigationSubscription.unsubscribe();
    this.accountSelected = null;
  }

  rowsPerPage(select) {
    this.perPage = select.value;
    if (this.assetsActive) {
      this.loadAssets(this.currentAssetPage - 1);
    } else {
      this.search(this.currentSearchPage - 1);
    }
  }

  loadAssets(page = 0, perPage = this.perPage, address = this.accountSelected) {
    this.assetsActive = true;
    this.searchActive = false;
    // Resets
    this.renderer.removeClass(this.el.nativeElement.querySelector('#selectAll').parentNode.parentNode.parentNode, 'checkbox--checked');
    this.selectAllText = 'Select all';
    this.assetsService.unselectAssets();
    this.assets = {
      assets: [],
      resultCount: 0
    };
    this.searchNoResultsFound = null;
    this.loader = true;
    this.assetSub = this.assetsService.getAssetsInfo(page, perPage, address).subscribe(
      (resp: any) => {
        this.loader = false;
        this.assets = resp;
        console.log(this.assets);
        this.currentAssetPage = page + 1;
        this.resultCountAsset = resp.resultCount;
        this.totalAssetPages = Math.ceil(resp.resultCount / perPage);
        // generate pagination
        this.pagination = this.paginationGenerate(this.currentAssetPage, this.totalAssetPages);
      },
      err => {
        this.loader = false;
        console.log('Error getting assets: ', err);
      }
    );
  }

  search(page = 0, perPage = this.perPage, address = this.accountSelected) {
    const search = this.el.nativeElement.querySelector('#search').value;
    const select = this.el.nativeElement.querySelector('#select').value;
    this.searchPlaceholder = 'ie. Green apple';
    if (search.length < 1) {
      if (this.searchActive) {
        this.pageLoad();
        this.assetsActive = true;
        this.searchActive = false;
      } else {
        this.searchPlaceholder = 'Please type something first';
      }
      return;
    }
    this.searchActive = true;
    this.assetsActive = false;

    // Resets
    this.renderer.removeClass(this.el.nativeElement.querySelector('#selectAll').parentNode.parentNode.parentNode, 'checkbox--checked');
    this.selectAllText = 'Select all';
    this.assetsService.unselectAssets();
    this.assets = {
      assets: [],
      resultCount: 0
    };

    // Show search preloader
    this.loader = true;

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
        address = searchValues[0].trim();
        queries.push({
          param: 'createdBy',
          value: address
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
            value: ide[1] ? ide[1].trim() : ''
          };
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
            value: ide[1] ? ide[1].trim() : ''
          };
          _queries.push(_query);

          return _queries;
        }, queries);
        break;
    }

    if (select !== 'createdBy') {
      queries.push({
        param: 'createdBy',
        value: address
      });
    }

    this.searchResults = null;
    this.searchNoResultsFound = null;
    this.searchResultsFound = null;

    // Make a request here
    this.assetsService.searchEvents(queries, page, perPage, address).then((resp: any) => {
      this.loader = false;
      if (resp.assets.length > 0) {
        this.assets = resp;
        this.currentSearchPage = page + 1;
        this.resultCountSearch = resp.resultCount;
        this.totalSearchPages = Math.ceil(resp.resultCount / perPage);
        // generate pagination
        this.pagination = this.paginationGenerate(this.currentSearchPage, this.totalSearchPages);
        this.searchResultsFound = `Found ${resp.resultCount} results`;
      } else {
        this.searchNoResultsFound = 'No results found';
      }
    }).catch(err => {
      this.loader = false;
      console.log(err);
    });
  }

  findInfo(info) {
    const infoEvent = info.content.data.find((obj) => obj.type === 'ambrosus.asset.info');
    return infoEvent;
  }

  paginationGenerate(currentPage, pageCount) {
    const delta = 2,
        left = currentPage - delta,
        right = currentPage + delta + 1;
    let result = [];

    result = Array.from({length: pageCount}, (v, k) => k + 1)
        .filter(i => i && i >= left && i < right);

    if (result.length > 1) {
      // Add first page and dots
      if (result[0] > 1) {
        if (result[0] > 2) {
          result.unshift('...');
        }
        result.unshift(1);
      }

      // Add dots and last page
      if (result[result.length - 1] < pageCount) {
        if (result[result.length - 1] !== pageCount - 1) {
          result.push('...');
        }
        result.push(pageCount);
      }
    }

    return result;
  }

  onSelectAll(e, input) {
    const assetsList = this.el.nativeElement.querySelectorAll('.assets-list__item.table');
    if (input.checked) {
      this.selectAllText = 'Unselect all';
      for (const asset of assetsList) {
        const checkbox = asset.children[0].children[0].children[0];
        checkbox.checked = true;
        this.assetsService.selectAsset(checkbox.name);
      }
      this.assetsService.toggleSelect.next('true');
    } else {
      this.selectAllText = 'Select all';
      for (const asset of assetsList) {
        const checkbox = asset.children[0].children[0].children[0];
        checkbox.checked = false;
      }
      this.assetsService.unselectAssets();
      this.assetsService.toggleSelect.next('true');
    }
  }
}
