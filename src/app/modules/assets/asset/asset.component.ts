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

import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventAddComponent } from './../event-add/event-add.component';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { AssetAddComponent } from '../asset-add/asset-add.component';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  asset: any = {};
  assetId: string;
  timeline;
  json: any = '';
  jsonEventsRaw: any;
  jsonEvents: any;
  account: any = {};
  noContent = false;
  dialogs: {
    event?: MatDialogRef<any>,
    asset?: MatDialogRef<any>,
  } = {};

  objectKeys = Object.keys;
  isArray = Array.isArray;
  stringify = JSON.stringify;

  isObject(value) {
    return typeof value === 'object';
  }

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    public assetsService: AssetsService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};

    this.subs[this.subs.length] = this.assetsService.asset.subscribe(
      (asset: any) => {
        console.log('Asset: ', asset);
        this.asset = asset;

        if (asset.info) {
          if (
            !asset.info.images &&
            !asset.info.description &&
            !asset.info.documents &&
            !(asset.info.identifiers && asset.info.identifiers.identifiers) &&
            !(asset.info.properties && asset.info.properties.length) &&
            !(asset.info.groups && asset.info.groups.length)
          ) {
            this.noContent = true;
          }
        }
      },
    );

    this.subs[this.subs.length] = this.assetsService.progress.status.start.subscribe(next => {
      Object.keys(this.dialogs).map(key => this.dialogs[key].close());
    });

    this.subs[this.subs.length] = this.route.params.subscribe(({ assetid }: any) => this.assetId = assetid);
    this.assetsService.events.subscribe(events => this.timeline = events && events.data && !!events.data.length);
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  editInfoEvent() {
    this.dialogs.asset = this.dialog.open(AssetAddComponent, {
      panelClass: 'dialog',
      disableClose: true,
      data: {
        assetId: this.asset.assetId,
        prefill: this.asset,
        for: 'assets',
      },
    });
  }

  async viewJSON() {
    if (this.json) { return this.json = ''; }
    this.json = 'View as Data';
    if (this.jsonEvents) { return this.jsonEvents; }
    try {
      this.jsonEventsRaw = await this.assetsService.getMaxEvents({ assetId: this.assetId, limit: 200 });
      this.jsonEventsRaw.data.map(event => {

        delete event._id;
        delete event.eventId;
        delete event.content.idData.dataHash;
        delete event.content.signature;
        delete event.metadata;
        delete event.repository;

        event.content.idData.assetId = '{{ assetId }}';
        event.content.idData.timestamp = '{{ timestamp }}';

        event.content.data.map(item => {
          if (item.timestamp) {
            item.timestamp = '{{ timestamp }}';
          }

          return item;
        });

        return event;
      });
      this.jsonEvents = JSON.stringify(this.jsonEventsRaw.data, null, 2);
    } catch (error) {
      console.error('[GET] Max events: ', error);
    }
  }

  valueJSON(value) {
    return value.replace(/["{}\[\]]/g, '').replace(/^\s+/m, '');
  }

  downloadJSON() {
    const url =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(this.jsonEvents);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  downloadQR(el: any) {
    const data = el.el.nativeElement.children[0].src;
    const filename = `QR_code_${this.assetId}.png`;
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(data, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = data;
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  openAddEventDialog() {
    this.dialogs.event = this.dialog.open(EventAddComponent, {
      panelClass: 'dialog',
      disableClose: true,
      data: {
        assetIds: [this.assetId],
      },
    });
  }
}
