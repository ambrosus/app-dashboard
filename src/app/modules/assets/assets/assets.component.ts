/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventAddComponent } from './../event-add/event-add.component';
import { AssetAddComponent } from './../asset-add/asset-add.component';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';
import { StorageService } from '../../../services/storage.service';

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
  selected;
  account: any = {};
  dialogs: {
    asset?: MatDialogRef<any>,
    event?: MatDialogRef<any>,
  } = {};

  constructor(
    public assetsService: AssetsService,
    public dialog: MatDialog,
    private router: Router,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};

    if (this.assetsService.initiatedNoAssets) {
      this.assetsService.getAssets().then();
      this.assetsService.initiatedNoAssets = false;
    }

    this.subs[this.subs.length] = this.assetsService.assets.subscribe(
      ({ data, pagination }: any) => {
        console.log('[GET] Assets: ', data);
        this.pagination = pagination;
        this.selected = 0;

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

    this.subs[this.subs.length] = this.assetsService.progress.status.start.subscribe(next => {
      if (this.dialogs.asset) { this.dialogs.asset.close(); }
      if (this.dialogs.event) { this.dialogs.event.close(); }
    });

    this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.selected = 0;
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

  JSONparse(value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return false;
    }
  }

  select(selected = true) {
    this.selected = this.forms.table.get('assets')['controls'].filter(asset => {
      asset.get('selected').setValue(selected);
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
    this.dialogs.event = this.dialog.open(EventAddComponent, {
      panelClass: 'dialog',
      disableClose: true,
      data: {
        assetIds,
      },
    });
  }

  createAsset() {
    this.dialogs.asset = this.dialog.open(AssetAddComponent, {
      panelClass: 'dialog',
      disableClose: true,
    });
  }
}
