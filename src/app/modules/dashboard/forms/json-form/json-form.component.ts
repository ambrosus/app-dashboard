import { Component, OnInit, Input } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { StorageService } from 'app/services/storage.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-json-form',
  templateUrl: './json-form.component.html',
  styleUrls: ['./json-form.component.scss'],
})
export class JsonFormComponent implements OnInit {
  error;
  success;
  spinner;
  textArea: any = '';
  sequenceNumber = 0;

  @Input() assetIds: String[];
  @Input() for: 'assets';

  constructor(
    private storageService: StorageService,
    private assetsService: AssetsService,
    private router: Router,
  ) {}

  ngOnInit() {}

  cancel() {
    this.router.navigate([`${location.pathname}`]);
  }

  validateJSON(input) {
    try {
      JSON.parse(input.value);
      this.error = false;
      return true;
    } catch (error) {
      this.error = 'JSON is invalid, please fix it first';
      return false;
    }
  }

  uploadJSON(event) {
    const file = event.target.files[0];
    const that = this;

    const reader = new FileReader();

    reader.onload = function(e) {
      const text = reader.result;
      that.textArea = text;
    };

    reader.onerror = function(e) {
      console.error('[UPLOAD]: ', e);
    };

    reader.onabort = function(e) {};

    reader.readAsText(file);
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

  async save(input) {
    this.error = false;
    this.success = false;
    let json = null;
    try {
      json = JSON.parse(input.value);
    } catch (e) {}

    if (!json) {
      this.error = 'Input some valid JSON first';
    }

    if (
      !confirm(
        `Are you sure you want to proceed creating ${
          this.for === 'assets' ? 'this asset' : 'these events'
        }?`,
      )
    ) {
      return;
    }

    this.spinner = true;

    if (this.for === 'assets') {
      // Create asset and info event
      const asset = this.generateAsset();
      const infoEvent = this.generateEvents(json, [asset.assetId]);

      this.assetsService.createAssets([asset]).subscribe(
        response => console.log('[CREATE] Asset: ', response),
        error => console.error('[CREATE] Asset: ', error),
        () => {
          this.sequenceNumber += 1;
          this.assetsService
            .createEvents(infoEvent)
            .subscribe(
              response => console.log('[CREATE] Event: ', response),
              error => console.error('[CREATE] Event: ', error),
              () => (this.success = 'Success'),
            );
        },
      );
    } else {
      // Edit or add events
      const events = this.generateEvents(json);

      this.assetsService
        .createEvents(events)
        .subscribe(
          response => console.log('[CREATE] Event: ', response),
          error => console.error('[CREATE] Event: ', error),
          () => (this.success = 'Success'),
        );
    }
  }
}
