import { Component, ElementRef, OnInit, Renderer2, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventAddComponent } from './../event-add/event-add.component';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [AssetsService]
})
export class AssetsComponent implements OnInit, OnDestroy {
  navigationSubscription;

  toggleDropdown: false;

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
  createEvents = false;
  assetSub: Subscription;
  // Search
  searchPlaceholder = 'ie. Green apple';
  searchResultsFound;
  searchNoResultsFound;
  searchResults;
  // Pagination
  currentAssetPage = 1;
  totalAssetPages = 0;
  resultCountAsset;
  currentSearchPage = 1;
  totalSearchPages = 0;
  resultCountSearch;
  assetsActive = true;
  searchActive = false;
  pagination = [];

  constructor(
    private assetsService: AssetsService,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private storage: StorageService,
    private auth: AuthService,
    public dialog: MatDialog
  ) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.pageLoad();
      }
    });
  }

  pageLoad() {
    this.assetsService = new AssetsService(this.storage);
    this.ngOnInit();
    this.loadAssets();
    this.el.nativeElement.querySelector('#search').value = '';
  }

  bulkActions(action) {
    switch (action.value) {
      case 'createEvent':
        if (this.assetsService.getSelectedAssets().length === 0) {
          alert(`You didn\'t select any assets. Please do so first.`);
        } else {
          this.createEventsDialog();
        }
        break;
    }

    action.value = 'default';
  }

  ngOnInit() {
    // Bind this for pagination
    this.loadAssets = this.loadAssets.bind(this);
    this.search = this.search.bind(this);

    this.auth.getAccounts().subscribe(
      (resp: any) => {
        const _address = this.storage.get('address');
        if (!resp.data.some(account => account.address === _address)) {
          this.accounts = [
            {
              full_name: this.storage.get('full_name') || 'My account',
              address: _address
            }
          ];
        } else {
          this.accounts = resp.data;
          // Loggedin user always default
          this.accounts.map((account, index) => {
            if (account.address === _address) {
              this.accounts.splice(index, 1);
              this.accounts.unshift(account);
            }
          });
        }
      },
      err => {
        this.accounts = [
          {
            full_name: this.storage.get('full_name') || 'My account',
            address: this.storage.get('address')
          }
        ];
      }
    );

    this.accountSelected = this.storage.get('address');
  }

  changeAccount(acc) {
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

  resetLoadAssets() {
    this.assetsActive = true;
    this.searchActive = false;
    this.renderer.removeClass(this.el.nativeElement.querySelector('#selectAll').parentNode.parentNode.parentNode, 'checkbox--checked');
    this.selectAllText = 'Select all';
    this.assetsService.unselectAssets();
    this.assets = {
      assets: [],
      resultCount: 0
    };
    this.searchNoResultsFound = null;
  }

  loadAssets(page = 0, perPage = this.perPage) {
    this.resetLoadAssets();
    this.loader = true;
    const address = this.accountSelected;
    this.assetSub = this.assetsService.getAssetsInfo(page, perPage, address).subscribe(
      (resp: any) => {
        this.loader = false;
        this.assets = resp;
        this.currentAssetPage = page + 1;
        this.resultCountAsset = resp.resultCount;
        this.totalAssetPages = Math.ceil(resp.resultCount / perPage);
        // generate pagination
        this.pagination = this.paginationGenerate(this.currentAssetPage, this.totalAssetPages);
      },
      err => {
        this.loader = false;
        console.log('AssetsInfo get failed: ', err);
      }
    );
  }

  resetSearch() {
    this.searchActive = true;
    this.assetsActive = false;
    this.renderer.removeClass(this.el.nativeElement.querySelector('#selectAll').parentNode.parentNode.parentNode, 'checkbox--checked');
    this.selectAllText = 'Select all';
    this.assetsService.unselectAssets();
    this.assets = {
      assets: [],
      resultCount: 0
    };
  }

  search(page = 0, perPage = this.perPage, address = this.accountSelected) {
    const search = this.el.nativeElement.querySelector('#search').value;
    const select = this.el.nativeElement.querySelector('#select').value;
    this.searchPlaceholder = 'ie. Green apple';
    if (search.length < 1) {
      if (this.searchActive) {
        this.pageLoad();
      } else {
        this.searchPlaceholder = 'Please type something first';
      }
      return;
    }
    this.resetSearch();
    this.loader = true;

    const searchValues = search.split(',');
    const queries = {};
    switch (select) {
      case 'name':
        queries['data[name]'] = searchValues[0].trim();
        break;
      case 'createdBy':
        queries['createdBy'] = searchValues[0].trim();
        break;
      case 'type':
        queries['data[type]'] = `ambrosus.asset.${searchValues[0].trim()}`;
        break;
      case 'asset identifiers':
        queries['data[type]'] = `ambrosus.asset.identifiers`;
        searchValues.map((query) => {
          const ide = query.split(':');
          const param = `data[identifiers.${ide[0].trim()}]`;
          const value = ide[1] ? ide[1].trim() : '';
          queries[param] = value;
        });
        break;
      case 'event identifiers':
        queries['data[type]'] = `ambrosus.event.identifiers`;
        searchValues.map((query) => {
          const ide = query.split(':');
          const param = `data[identifiers.${ide[0].trim()}]`;
          const value = ide[1] ? ide[1].trim() : '';
          queries[param] = value;
        });
        break;
    }

    if (select !== 'createdBy') {
      queries['createdBy'] = address;
    }

    this.searchResults = null;
    this.searchNoResultsFound = null;
    this.searchResultsFound = null;

    // Make a request
    this.assetsService.getEvents(queries, page, perPage)
      .then((resp: any) => {
        this.assetsService.attachInfoEvents(resp, address).then((r: any) => {
          this.loader = false;
          if (r.assets.length > 0) {
            this.assets = r;
            this.currentSearchPage = page + 1;
            this.resultCountSearch = r.resultCount;
            this.totalSearchPages = Math.ceil(r.resultCount / perPage);
            // generate pagination
            this.pagination = this.paginationGenerate(this.currentSearchPage, this.totalSearchPages);
            this.searchResultsFound = `Found ${r.resultCount} results`;
          } else {
            this.searchNoResultsFound = 'No results found';
          }
        }).catch(e => {});
      })
      .catch(err => {
        this.loader = false;
      });
  }

  findInfo(info) {
    const infoEvent = info.content.data.find(obj => obj.type === 'ambrosus.asset.info');
    return infoEvent;
  }

  paginationGenerate(currentPage, pageCount) {
    const delta = 2,
      left = currentPage - delta,
      right = currentPage + delta + 1;
    let result = [];

    result = Array.from({ length: pageCount }, (v, k) => k + 1).filter(i => i && i >= left && i < right);

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
    let table = this.el.nativeElement.querySelectorAll('.table__item.table');
    table = Array.from(table);
    if (input.checked) {
      this.selectAllText = 'Unselect all';
      table.map((item) => {
        const checkbox = item.children[0].children[0].children[0];
        checkbox.checked = true;
        this.assetsService.selectAsset(checkbox.name);
      });
      const event = new Event('on:checked');
      window.dispatchEvent(event);
    } else {
      this.selectAllText = 'Select all';
      table.map((item) => {
        const checkbox = item.children[0].children[0].children[0];
        checkbox.checked = false;
      });
      this.assetsService.unselectAssets();
      const event = new Event('on:checked');
      window.dispatchEvent(event);
    }
  }

  createEventsDialog() {
    const dialogRef = this.dialog.open(EventAddComponent, {
      width: '600px',
      position: { right: '0'}
    });
    const instance = dialogRef.componentInstance;
    instance.assetId = this.assetsService.getSelectedAssets();
    instance.isMultiple = true;

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
