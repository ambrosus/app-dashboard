/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, ElementRef, OnInit, Renderer2, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EventAddComponent } from './../event-add/event-add.component';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetsComponent implements OnInit, OnDestroy {
  navigationSubscription: Subscription;
  assetsSubscription: Subscription;
  eventsSubscription: Subscription;
  assets: any[] = [];
  assetIds: String[] = [];
  // Pagination
  pagination = {
    currentPage: 1,
    perPage: 15,
    totalPages: 0,
    resultCount: 0,
    resultLength: 0,
  };
  // Search
  searchActive = false;
  searchPlaceholder = 'ie. Green apple';
  // Other
  error = false;
  selectAllText = 'Select all';
  loader = false;

  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.assetsSubscription = this.router.events.subscribe((e: any) => { if (e instanceof NavigationEnd) { this.loadAssets(); } });
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.assetsSubscription) { this.assetsSubscription.unsubscribe(); }
    if (this.eventsSubscription) { this.eventsSubscription.unsubscribe(); }
    if (this.navigationSubscription) { this.navigationSubscription.unsubscribe(); }
  }

  loadAssets(page = 1, perPage = 15) {
    this.resetLoadAssets();
    this.loader = true;
    const token = this.authService.getToken();
    this.assetsSubscription = this.assetsService.getAssets({ page, perPage, token }).subscribe(
      (assets: any) => {
        console.log(assets);
        this.loader = false;
        this.assets = assets.docs;
        this.pagination.currentPage = assets.page;
        this.pagination.perPage = perPage;
        this.pagination.resultCount = assets.total;
        this.pagination.resultLength = this.assets.length;
        this.pagination.totalPages = Math.ceil(assets.total / perPage);
      },
      err => {
        this.loader = false;
        console.log('Assets GET failed: ', err);
      }
    );
  }

  resetLoadAssets() {
    this.searchActive = false;
    this.el.nativeElement.querySelector('#search').value = '';
    this.renderer.removeClass(this.el.nativeElement.querySelector('#selectAll').parentNode.parentNode.parentNode, 'checkbox--checked');
    this.selectAllText = 'Select all';
    this.assets = [];
    this.loadAssets = this.loadAssets.bind(this);
  }

  JSONparse(value) {
    try {
      return JSON.parse(value);
    } catch (e) { return false; }
  }

  getName(eventObject, alternative = '') {
    try {
      const obj = JSON.parse(eventObject);
      const name = obj.name;
      const type = obj.type.split('.');
      return name ? name : type[type.length - 1];
    } catch (e) { return alternative; }
  }

  bulkActions(action) {
    switch (action.value) {
      case 'createEvent':
        if (this.assetIds.length === 0) {
          alert(`You didn\'t select any assets. Please do so first.`);
        } else {
          this.createEventsDialog();
        }
        break;
    }

    action.value = 'default';
  }

  search(page = 0, perPage = 15) {
    const search = this.el.nativeElement.querySelector('#search').value;
    const select = this.el.nativeElement.querySelector('#select').value;
    if (search.length === 0) {
      if (this.searchActive) { this.loadAssets(); } else { this.searchPlaceholder = 'Please type something first'; }
      return;
    }
    this.resetSearch();
    this.loader = true;

    const searchValues = search.split(',');
    const token = this.authService.getToken();
    const options = {
      assets: true,
      token,
      page,
      perPage,
    };
    switch (select) {
      case 'name':
        options['data'] = `data[name]=${searchValues[0].trim()}`;
        break;
      case 'createdBy':
        options['createdBy'] = `createdBy=${searchValues[0].trim()}`;
        break;
      case 'type':
        options['data'] = `data[type]=${searchValues[0].trim()}`;
        break;
    }
    this.eventsSubscription = this.assetsService.getEvents(options).subscribe(
      (assets: any) => {
        this.loader = false;
        this.assets = assets.docs;
        this.pagination.resultCount = assets.total;
        this.pagination.totalPages = Math.ceil(assets.total / perPage);
        this.pagination.currentPage = page;
        this.pagination.perPage = perPage;
        this.pagination.resultLength = this.assets.length;
      },
      err => {
        this.loader = false;
        console.log('Assets GET failed: ', err);
        this.pagination['resultCount'] = 0;
        this.pagination['resultLength'] = 0;
      }
    );
  }

  resetSearch() {
    this.searchActive = true;
    this.renderer.removeClass(this.el.nativeElement.querySelector('#selectAll').parentNode.parentNode.parentNode, 'checkbox--checked');
    this.selectAllText = 'Select all';
    this.assets = [];
    this.searchPlaceholder = 'ie. Green apple';
  }

  createEventsDialog() {
    const dialogRef = this.dialog.open(EventAddComponent, {
      width: '600px',
      position: { right: '0' },
    });
    const instance = dialogRef.componentInstance;
    instance.assetIds = this.assetIds;
    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }

  toggleId(action, id) {
    const index = this.assetIds.indexOf(id);
    switch (action) {
      case 'add':
        if (index === -1) { this.assetIds.push(id); }
        break;
      default:
        if (index > -1) { this.assetIds.splice(index, 1); }
    }
  }

  onSelectAll(e, input) {
    let table = this.el.nativeElement.querySelectorAll('.table__item.table');
    table = Array.from(table);
    if (input.checked) {
      this.selectAllText = 'Unselect all';
      table.map((item) => {
        this.renderer.addClass(item, 'checkbox--checked');
        this.toggleId('add', item.id);
      });
    } else {
      this.selectAllText = 'Select all';
      table.map((item) => {
        this.renderer.removeClass(item, 'checkbox--checked');
        this.toggleId('remove', item.id);
      });
    }
  }

  onSelect(e, item) {
    const active = item.classList.contains('checkbox--checked');
    const action = active ? 'removeClass' : 'addClass';
    this.renderer[action](item, 'checkbox--checked');
    if (active) { this.toggleId('remove', item.id); } else { this.toggleId('add', item.id); }
  }
}
