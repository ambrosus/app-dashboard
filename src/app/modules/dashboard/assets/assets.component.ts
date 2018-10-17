/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, ElementRef, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EventAddComponent } from './../event-add/event-add.component';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetsComponent implements OnInit, OnDestroy {
  navigationSub: Subscription;
  assetsSub: Subscription;
  eventsSub: Subscription;
  forms: {
    table?: FormGroup,
    search?: FormGroup
  } = {};
  // Pagination
  assets: any[] = [];
  pagination = {
    currentPage: 1,
    perPage: 15,
    totalPages: 0,
    resultCount: 0,
    resultLength: 0,
  };
  // Search
  searchActive = false;
  // Other
  error = false;
  loader = false;
  selectButton = 'Select all';
  selected;

  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
    private el: ElementRef,
    private router: Router,
    public dialog: MatDialog,
    private storageService: StorageService
  ) {
    this.initTableForm();
    this.initSearchForm();
    this.navigationSub = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd && this.authService.isLoggedIn()) { this.loadAssets(); }
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.assetsSub) { this.assetsSub.unsubscribe(); }
    if (this.eventsSub) { this.eventsSub.unsubscribe(); }
    if (this.navigationSub) { this.navigationSub.unsubscribe(); }
  }

  initTableForm() {
    this.forms.table = new FormGroup({
      assets: new FormArray([]),
    });
  }

  initSearchForm() {
    this.forms.search = new FormGroup({
      input: new FormControl(null, [Validators.required]),
    });
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

  getImage(asset) {
    try {
      const info = JSON.parse(asset.value.infoEvent);
      return info.images.default.url;
    } catch (e) { return '/assets/raster/logotip.jpg'; }
  }

  select() {
    this.selected = !this.selected;
    this.selectButton = this.selected ? 'Unselect all' : 'Select all';
    this.forms.table.get('assets')['controls'].map(asset => asset.get('selected').setValue(this.selected));
  }

  bulkEvent() {
    const assetIds = [];
    this.forms.table.get('assets')['controls'].map(asset => {
      if (asset.value.selected) { assetIds.push(asset.value.assetId); }
    });
    if (!assetIds.length) { return alert(`You didn\'t select any assets. Please do so first.`); }
    const dialogRef = this.dialog.open(EventAddComponent, {
      width: '600px',
      position: { right: '0' },
    });
    const instance = dialogRef.componentInstance;
    instance.assetIds = assetIds;
    dialogRef.afterClosed().subscribe(result => console.log('Bulk event dialog was closed'));
  }

  resetLoadAssets() {
    this.searchActive = false;
    this.el.nativeElement.querySelector('#search').value = '';
    this.assets = [];
    this.loadAssets = this.loadAssets.bind(this);
  }

  loadAssets(page = 1, perPage = 15) {
    this.resetLoadAssets();
    this.loader = true;
    const token = this.authService.getToken();
    const user = <any>this.storageService.get('user') || {};
    const { address } = user;
    this.assetsSub = this.assetsService.getAssets({ address, page, perPage, token }).subscribe(
      (assets: any) => {
        console.log(assets);
        this.loader = false;
        this.forms.table = new FormGroup({
          assets: new FormArray([]),
        });
        this.assets = assets.docs || [];

        // Table form
        this.assets.map(asset => {
          (<FormArray>this.forms.table.get('assets')).push(new FormGroup({
            assetId: new FormControl(asset.assetId),
            infoEvent: new FormControl(asset.infoEvent),
            latestEvent: new FormControl(asset.latestEvent),
            createdAt: new FormControl(asset.createdAt),
            selected: new FormControl(null),
          }));
        });

        // Pagination
        this.pagination.currentPage = page;
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

  search(page = 0, perPage = 15) {
    this.searchActive = true;
    this.selectButton = 'Select all';
    const data = this.forms.search.value;

    if (!data.input.length) { return this.loadAssets(); }

    this.loader = true;
    const token = this.authService.getToken();
    const options = {
      assets: true,
      token,
      page,
      perPage,
    };
    // Search by name
    options['data'] = `data[name]=${data.input.trim()}`;

    this.eventsSub = this.assetsService.getEvents(options).subscribe(
      (assets: any) => {
        console.log(assets);
        this.loader = false;
        this.forms.table = new FormGroup({
          assets: new FormArray([]),
        });
        this.assets = assets.docs || [];

        // Table form
        this.assets.map(asset => {
          (<FormArray>this.forms.table.get('assets')).push(new FormGroup({
            assetId: new FormControl(asset.assetId),
            infoEvent: new FormControl(asset.infoEvent),
            latestEvent: new FormControl(asset.latestEvent),
            createdAt: new FormControl(asset.createdAt),
            selected: new FormControl(null),
          }));
        });

        // Pagination
        this.pagination.resultCount = assets.total;
        this.pagination.totalPages = Math.ceil(assets.total / perPage);
        this.pagination.currentPage = page + 1;
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
}
