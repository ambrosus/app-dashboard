/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
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
  forms: {
    table?: FormGroup,
    search?: FormGroup
  } = {};
  assets: any;
  selectButton = 'Select all';
  loader;
  error;
  selected;

  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private storageService: StorageService,
  ) {
    this.initTableForm();
    this.initSearchForm();
    this.navigationSub = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd && this.authService.isLoggedIn()) { this.loadAssets(); }
    });
    this.assetsService._assets.subscribe(
      (assets: any) => {
        console.log('[GET] Assets: ', assets);
        this.assets = assets;

        this.loader = false;

        // Table form
        assets.results.map(asset => {
          (<FormArray>this.forms.table.get('assets')).push(new FormGroup({
            assetId: new FormControl(asset.assetId),
            infoEvent: new FormControl(asset.infoEvent),
            createdAt: new FormControl(asset.content.idData.timestamp),
            selected: new FormControl(null),
          }));
        });
      },
    );
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.assetsSub) { this.assetsSub.unsubscribe(); }
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

  getName(obj, alternative = 'No title') {
    try {
      const name = obj.name;
      let type = obj.type.split('.');
      type = type[type.length - 1];
      return [name, type].find(item => item);
    } catch (e) { return alternative; }
  }

  getImage(asset) {
    try {
      const info = asset.value.infoEvent;
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
    const data = this.forms.table.getRawValue();
    data.assets.map(asset => {
      if (asset.selected) { assetIds.push(asset.assetId); }
    });
    if (!assetIds.length) { return alert(`You didn\'t select any assets. Please do so first.`); }
    const dialogRef = this.dialog.open(EventAddComponent, {
      width: '600px',
      position: { top: '0', right: '0' },
    });
    const instance = dialogRef.componentInstance;
    instance.assetIds = assetIds;
    dialogRef.afterClosed().subscribe(result => console.log('[Bulk event] was closed'));
  }

  loadAssets(next = null, previous = null, limit = 15) {
    this.dialog.closeAll();
    this.loader = true;
    const token = this.authService.getToken();
    const user = <any>this.storageService.get('user') || {};
    const { address } = user;
    const options = { limit, token, address };
    if (next) { options['next'] = next; }
    if (previous) { options['previous'] = previous; }

    this.assetsSub = this.assetsService.getAssets(options).subscribe();
  }

  search() {
    console.log('search');
  }
}
