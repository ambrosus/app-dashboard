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

import { Component, OnInit, Input, Inject } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { StorageService } from 'app/services/storage.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { FormGroup, FormControl } from '@angular/forms';
import { checkJSON } from 'app/util';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfirmComponent } from 'app/shared/components/confirm/confirm.component';
import { ProgressComponent } from 'app/shared/components/progress/progress.component';
import { MessageService } from 'app/services/message.service';

@Component({
  selector: 'app-json-form',
  templateUrl: './json-form.component.html',
  styleUrls: ['./json-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JsonFormComponent implements OnInit {
  forms: {
    json?: FormGroup,
  } = {};
  sequenceNumber = 0;
  promise: any = {};
  hasPermission = true;
  dialogs: {
    progress?: MatDialogRef<any>,
    confirm?: MatDialogRef<any>,
  } = {};

  @Input() assetIds: string[];
  @Input() for: 'assets';
  @Input() prefill: any;

  constructor(
    private storageService: StorageService,
    public assetsService: AssetsService,
    private dialog: MatDialog,
    private messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.forms.json = new FormGroup({
      data: new FormControl('', [checkJSON(false)]),
    });

    const account: any = this.storageService.get('account') || {};
    this.hasPermission = account.permissions && Array.isArray(account.permissions);
    if (this.for === 'assets') {
      this.hasPermission = this.hasPermission && account.permissions.indexOf('create_asset') > -1;
    } else {
      this.hasPermission = this.hasPermission && account.permissions.indexOf('create_event') > -1;
    }

    this.assetIds = this.data && (this.data.assetIds || [this.data.assetId]) || this.assetIds;
    this.for = this.for || this.data && this.data.for;
    this.prefill = this.prefill || this.data && this.data.prefill;

    if (this.prefill) {
      this.prefillForm();
    }
  }

  prefillForm() {
    let json = JSON.parse(JSON.stringify(this.for === 'assets' ? this.assetsService.json.asset : this.assetsService.json.event));
    delete json._id;
    delete json.assetId;
    delete json.metadata;
    delete json.repository;
    delete json.eventId;
    delete json.content.idData.dataHash;
    delete json.content.signature;
    json.content.data.map(obj => {
      if (obj.type.split('.').length === 1) {
        obj.type = `ambrosus.${this.for === 'assets' ? 'asset' : 'event'}.${obj.type}`;
      }
    });

    if (!Array.isArray(json)) {
      json = [json];
    }

    this.forms.json.get('data').setValue(JSON.stringify(json, null, 2));
  }

  to(P: Promise<any>) {
    return P
      .then(response => response)
      .catch(error => ({ error }));
  }

  progress() {
    this.dialog.closeAll();

    this.dialogs.progress = this.dialog.open(ProgressComponent, {
      panelClass: 'progress',
      hasBackdrop: false,
    });

    this.dialogs.progress.afterClosed().subscribe(result => {
      console.log('Progress json form closed', result);
    });
  }

  confirm(question: string, buttons = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dialogs.confirm = this.dialog.open(ConfirmComponent, {
        panelClass: 'confirm',
        data: {
          question,
          buttons,
        },
      });

      this.dialogs.confirm.afterClosed().subscribe(result => {
        resolve(result);
      });
    });
  }

  insertTab(e, jsonInput) {
    if (e.keyCode === 9) {
      const start = jsonInput.selectionStart;
      const end = jsonInput.selectionEnd;

      const value = jsonInput.value;

      // set textarea value to: text before caret + tab + text after caret
      jsonInput.value = `${value.substring(0, start)}\t${value.substring(end)}`;

      // put caret at right position again (add one for the tab)
      jsonInput.selectionStart = jsonInput.selectionEnd = start + 1;

      // prevent the focus lose
      e.preventDefault();
    }
  }

  private generateAsset() {
    const address = this.storageService.get('account')['address'];
    const secret = this.storageService.get('secret');

    const idData = {
      timestamp: Math.floor(new Date().getTime() / 1000),
      sequenceNumber: this.sequenceNumber,
      createdBy: address,
    };

    const content = {
      idData,
      signature: this.assetsService.ambrosus.sign(idData, secret),
    };

    const asset = {
      assetId: this.assetsService.ambrosus.calculateHash(content),
      content,
    };

    return asset;
  }

  private generateEvents(json, _assetIds = this.assetIds) {
    const address = this.storageService.get('account')['address'];
    const secret = this.storageService.get('secret');
    let allEvents = [];

    if (!Array.isArray(json)) {
      json = [json];
    }

    _assetIds.map(assetId => {
      const assetEvents = JSON.parse(JSON.stringify(json));
      let incTimestamp = 1;

      assetEvents
        .filter(event => event.content && event.content.idData && event.content.data)
        .map(event => {
          event.content.idData['assetId'] = assetId;
          event.content.idData['createdBy'] = address;
          event.content.idData['dataHash'] = this.assetsService.ambrosus.calculateHash(event.content.data);
          if (
            !event.content.idData['timestamp'] ||
            !this.assetsService.ambrosus.utils.validTimestamp(event.content.idData['timestamp'])
          ) {
            event.content.idData['timestamp'] = Math.floor(
              new Date().getTime() / 1000,
            );
          }
          event.content.idData['timestamp'] = event.content.idData['timestamp'] + incTimestamp;
          incTimestamp += 1;

          if (
            !event.content.idData['accessLevel'] &&
            event.content.idData['accessLevel'] !== 0
          ) {
            event.content.idData['accessLevel'] = 1;
          }

          event.content['signature'] = this.assetsService.ambrosus.sign(
            event.content.idData,
            secret,
          );
          event['eventId'] = this.assetsService.ambrosus.calculateHash(event.content);
        });
      allEvents = allEvents.concat(assetEvents);
    });

    return allEvents;
  }

  create() {
    this.promise['create'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.json;
        const data = form.value;

        if (this.assetsService.progress.status.inProgress) {
          throw new Error('Please wait until current upload completes');
        }

        if (form.invalid) {
          throw new Error('Please insert some JSON data');
        }

        let json = JSON.parse(data.data);
        if (!Array.isArray(json)) {
          throw new Error('JSON has to be an array of objects (creating multiple events on one or more assets), or array of arrays (creating multiple assets), where each array has multiple events');
        }

        if (this.for === 'assets' && !this.prefill && !json.every(item => Array.isArray(item))) {
          json = [json];
        }

        let message = `Are you sure you want to proceed ${this.prefill ? 'editing' : 'creating'} `;
        if (this.for === 'assets') {
          message += `${json.length} asset${json.length === 1 ? '' : 's'}?`;
        } else {
          message += `${json.length} event${json.length === 1 ? '' : 's'}${this.for === 'assets' ? '' : ` on ${this.assetIds.length} asset${json.length === 1 ? '' : 's'}`}?`;
        }

        const confirm = await this.confirm(message);
        console.log('Confirm ->', confirm);
        if (!confirm) {
          return reject();
        }

        if (this.for === 'assets' && !this.prefill) {
          const creating = json.reduce((number, events) => {
            number += events.length;
            return number;
          }, 0) + json.length;

          this.assetsService.responses.push({
            timestamp: Date.now(),
            assets: {
              success: [],
              error: [],
            },
            events: {
              success: [],
              error: [],
            },
          });

          // Start progress
          this.assetsService.progress.title = `Creating ${json.length} asset${json.length === 1 ? '' : 's'}`;
          this.assetsService.progress.creating = creating;
          this.assetsService.progress.for = 'assets';
          this.progress();
          this.assetsService.progress.status.start.next();

          for (const _events of json) {
            const asset = this.generateAsset();
            const events = this.generateEvents(_events, [asset.assetId]);
            this.sequenceNumber += 1;

            const assetCreated = await this.to(this.assetsService.createAsset(asset));

            if (!assetCreated.error) {
              const eventsCreated = await this.assetsService.createEvents(events);
            }
          }
          this.assetsService.progress.status.done.next();

          resolve();
        } else {
          // Edit or add events
          const events = this.generateEvents(json);

          this.assetsService.responses.push({
            timestamp: Date.now(),
            assets: {
              success: [],
              error: [],
            },
            events: {
              success: [],
              error: [],
            },
          });

          // Start progress
          this.assetsService.progress.title = `Creating ${json.length} event${events.length === 1 ? '' : 's'}, on ${this.assetIds.length} asset${this.assetIds.length === 1 ? '' : 's'}`;
          this.assetsService.progress.creating = events.length;
          this.assetsService.progress.for = 'events';
          this.progress();
          this.assetsService.progress.status.start.next();

          const eventsCreated = await this.assetsService.createEvents(events);

          this.assetsService.progress.status.done.next();

          console.log('JSON form events done: ', this.assetsService.responses);

          resolve();
        }
      } catch (error) {
        this.assetsService.progress.status.done.next();

        this.messageService.error(error);
        console.error(`[CREATE] ${this.for}`, error);
        reject();
      }
    });
  }
}
