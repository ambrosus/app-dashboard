
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventAddComponent } from './../event-add/event-add.component';
import { AssetAddComponent } from './../asset-add/asset-add.component';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { getImage, getName } from 'app/util';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchComponent implements OnInit, OnDestroy {
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
  getImage = getImage;
  getName = getName;

  constructor(
    public assetsService: AssetsService,
    public dialog: MatDialog,
    private router: Router,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};

    this.subs[this.subs.length] = this.assetsService.assetsSearch.subscribe(
      ({ data, pagination }: any) => {
        console.log('[GET] Assets search: ', data);
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
