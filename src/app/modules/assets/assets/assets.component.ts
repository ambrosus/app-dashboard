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
import { AssetAddComponent } from './../asset-add/asset-add.component';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetsComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  forms: {
    table?: FormGroup;
  } = {};
  pagination;
  loader;
  error;
  selected;
  allSelected = false;
  selectButton = 'Select all';
  back;

  constructor(
    public assetsService: AssetsService,
    private authService: AuthService,
    public dialog: MatDialog,
    private storageService: StorageService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.subs[this.subs.length] = this.assetsService.assets.subscribe(
      ({ data, pagination }: any) => {
        console.log('[GET] Assets: ', data);
        this.pagination = pagination;
        this.loader = false;

        // Table form
        this.initTableForm();
        data.map(asset => {
          (<FormArray>this.forms.table.get('assets')).push(
            new FormGroup({
              assetId: new FormControl(asset.assetId),
              info: new FormControl(asset.info),
              createdBy: new FormControl(asset.content.idData.createdBy),
              createdAt: new FormControl(asset.content.idData.timestamp),
              selected: new FormControl(false),
            }),
          );
        });
      },
    );

    this.subs[this.subs.length] = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.dialog.closeAll();
      }
    });
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  initTableForm() {
    this.forms.table = new FormGroup({
      assets: new FormArray([]),
    });
  }

  loadAssets(next = '', limit = 15) {
    this.selected = 0;
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

    this.assetsService.getAssets(options).then();
  }

  JSONparse(value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return false;
    }
  }

  select() {
    this.allSelected = !this.allSelected;
    this.selectButton = this.allSelected ? 'Unselect all' : 'Select all';
    this.selected = this.forms.table.get('assets')['controls'].filter(asset => {
      asset.get('selected').setValue(this.allSelected);
      return asset.get('selected').value;
    }).length;
  }

  isSelected() {
    const table = this.forms.table.value;
    this.selected = table.assets.filter(asset => asset.selected).length;
  }

  bulkEvent() {
    const assetIds = [];
    const data = this.forms.table.getRawValue();
    data.assets.map(asset => {
      if (asset.selected) {
        assetIds.push(asset.assetId);
      }
    });
    if (!assetIds.length) {
      return alert(`You didn\'t select any assets. Please do so first.`);
    }
    this.dialog.open(EventAddComponent, {
      panelClass: 'dialog',
      data: {
        assetIds,
      },
    });
  }

  createAsset() {
    this.dialog.open(AssetAddComponent, {
      panelClass: 'dialog',
    });
  }
}
