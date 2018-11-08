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
  assetsSub: Subscription;
  getAssetsSub: Subscription;
  routerSub: Subscription;
  forms: {
    table?: FormGroup,
    search?: FormGroup
  } = {};
  pagination;
  selectButton = 'Select all';
  loader;
  error;
  selected;
  back;

  constructor(
    public assetsService: AssetsService,
    private authService: AuthService,
    public dialog: MatDialog,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.initSearchForm();

    this.assetsSub = this.assetsService.assets.subscribe(
      ({ data, pagination }: any) => {
        console.log('[GET] Assets: ', data);
        this.pagination = pagination;
        this.loader = false;

        // Table form
        this.initTableForm();
        data.map(asset => {
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

  ngOnDestroy() {
    if (this.assetsSub) { this.assetsSub.unsubscribe(); }
    if (this.getAssetsSub) { this.getAssetsSub.unsubscribe(); }
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

  loadAssets(next = '', limit = 15) {
    this.dialog.closeAll();
    this.loader = true;
    const token = this.authService.getToken();
    const account = <any>this.storageService.get('account') || {};
    const { address } = account;
    const options = {
      limit,
      token,
      address,
      next,
    };

    this.getAssetsSub = this.assetsService.getAssets(options).subscribe();
  }

  JSONparse(value) {
    try {
      return JSON.parse(value);
    } catch (e) { return false; }
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
      data: {
        assetIds,
      },
    });

    dialogRef.afterClosed().subscribe(result => console.log('[Bulk event] was closed'));
  }

  search() {
    console.log('search');
  }
}
