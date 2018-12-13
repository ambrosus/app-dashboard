import { Component, OnInit, Input } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { StorageService } from 'app/services/storage.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { FormGroup, FormControl } from '@angular/forms';
import { checkJSON } from 'app/util';
import { MatDialog, MatDialogRef } from '@angular/material';
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

  constructor(
    private storageService: StorageService,
    public assetsService: AssetsService,
    private dialog: MatDialog,
    private messageService: MessageService,
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
      signature: this.assetsService.sign(idData, secret),
    };

    const asset = {
      assetId: this.assetsService.calculateHash(content),
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
          event.content.idData['dataHash'] = this.assetsService.calculateHash(
            event.content.data,
          );
          if (
            !event.content.idData['timestamp'] ||
            !this.assetsService.validTimestamp(event.content.idData['timestamp'])
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

          event.content['signature'] = this.assetsService.sign(
            event.content.idData,
            secret,
          );
          event['eventId'] = this.assetsService.calculateHash(event.content);
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

        if (this.for === 'assets' && !json.every(item => Array.isArray(item))) {
          json = [json];
        }

        let message = 'Are you sure you want to proceed creating ';
        if (this.for === 'assets') {
          message += `${json.length} asset${json.length === 1 ? '' : 's'}?`;
        } else {
          message += `${json.length} events${this.for === 'assets' ? '' : ` on ${this.assetIds.length} assets`}?`;
        }

        const confirm = await this.confirm(message);
        console.log('Confirm ->', confirm);
        if (!confirm) {
          return reject();
        }

        if (this.for === 'assets') {
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
