import { Component, OnInit, Input } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { StorageService } from 'app/services/storage.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { FormGroup, FormControl } from '@angular/forms';
import { checkJSON } from 'app/util';
import { MatDialog } from '@angular/material';
import { ConfirmComponent } from 'app/shared/components/confirm/confirm.component';
import { ProgressComponent } from 'app/shared/components/progress/progress.component';

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

  @Input() assetIds: string[];
  @Input() for: 'assets';

  constructor(
    private storageService: StorageService,
    private assetsService: AssetsService,
    private dialog: MatDialog,
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

  progress() {
    const dialogRef = this.dialog.open(ProgressComponent, {
      panelClass: 'progress',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Progress json form closed', result);
    });
  }

  confirm(question: string, buttons = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        panelClass: 'confirm',
        data: {
          question,
          buttons,
        },
      });

      dialogRef.afterClosed().subscribe(result => {
        resolve(result);
      });
    });
  }

  async close() {
    const confirm = await this.confirm('Are you sure you want to close?', { cancel: 'No', ok: 'Yes' });
    console.log('Confirm ->', confirm);
    if (confirm) {
      this.dialog.closeAll();
    }
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

      assetEvents
        .filter(
          event => event.content && event.content.idData && event.content.data,
        )
        .map(event => {
          event.content.idData['assetId'] = assetId;
          event.content.idData['createdBy'] = address;
          event.content.idData['dataHash'] = this.assetsService.calculateHash(
            event.content.data,
          );
          if (
            !event.content.idData['timestamp'] ||
            !this.assetsService.validTimestamp(
              event.content.idData['timestamp'],
            )
          ) {
            event.content.idData['timestamp'] = Math.floor(
              new Date().getTime() / 1000,
            );
          } else {
            event.content.idData['timestamp'] =
              event.content.idData['timestamp'] + 1;
          }
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

        if (form.invalid) {
          throw new Error('Please insert some JSON data');
        }

        const json = JSON.parse(data.data);

        let amount = 1;
        if (Array.isArray(json)) {
          amount = json.length;
        }

        const confirm = await this.confirm(
          `Are you sure you want to proceed creating ${this.for === 'assets' ? '1 asset with' : ''} ${amount} events${this.for === 'assets' ? '' : ` on ${this.assetIds.length} assets`}?`);
        console.log('Confirm ->', confirm);
        if (!confirm) {
          return reject();
        }

        if (this.for === 'assets') {
          // Create asset and info event
          const asset = this.generateAsset();
          const events = this.generateEvents(json, [asset.assetId]);

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
          this.assetsService.progress.title = 'Creating asset';
          this.assetsService.progress.creating = 1 + events.length;
          this.assetsService.progress.for = 'assets';
          this.progress();

          this.assetsService.createAsset(asset).subscribe(
            async response => {
              this.sequenceNumber += 1;
              const eventsCreated = await this.assetsService.createEvents(events);

              console.log('JSON form assets done: ', this.assetsService.responses);

              resolve();
            },
            error => {
              throw new Error('Asset creation failed, aborting');
            },
          );
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
          this.assetsService.progress.title = `Creating ${amount} event${events.length === 1 ? '' : 's'}, on ${this.assetIds.length} asset${this.assetIds.length === 1 ? '' : 's'}`;
          this.assetsService.progress.creating = events.length;
          this.assetsService.progress.for = 'events';
          this.progress();

          const eventsCreated = await this.assetsService.createEvents(events);

          console.log('JSON form events done: ', this.assetsService.responses);

          resolve();
        }
      } catch (error) {
        console.error(`[CREATE] ${this.for}`, error);
        reject();
      }
    });
  }
}
