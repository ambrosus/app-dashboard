import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { StorageService } from 'app/services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-json-form',
  templateUrl: './json-form.component.html',
  styleUrls: ['./json-form.component.scss']
})
export class JsonFormComponent implements OnInit, OnDestroy {
  assetsCreateSubscription: Subscription;
  eventsCreateSubscription: Subscription;
  error;
  success;
  spinner;
  textArea: any = '';
  sequenceNumber = 0;

  @Input() prefill;
  @Input() assetIds: String[];
  @Input() for = 'assets';

  constructor(private storage: StorageService, private assetsService: AssetsService) { }

  ngOnInit() {
    if (this.prefill && this.assetIds) { this.textArea = this.prefill; }
  }

  ngOnDestroy() {
    if (this.assetsCreateSubscription) { this.assetsCreateSubscription.unsubscribe(); }
    if (this.eventsCreateSubscription) { this.eventsCreateSubscription.unsubscribe(); }
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

    reader.onload = function (e) {
      const text = reader.result;
      that.textArea = text;
    };
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
    const address = this.storage.get('user')['address'];
    const secret = this.storage.get('secret');

    const idData = {
      timestamp: Math.floor(new Date().getTime() / 1000),
      sequenceNumber: this.sequenceNumber,
      createdBy: address
    };

    const content = {
      idData,
      signature: this.assetsService.sign(idData, secret)
    };

    const asset = {
      assetId: this.assetsService.calculateHash(content),
      content
    };

    return asset;
  }

  private generateEvents(json, _assetIds = this.assetIds) {
    const address = this.storage.get('user')['address'];
    const secret = this.storage.get('secret');
    let allEvents = [];

    if (!Array.isArray(json)) { json = [json]; }

    _assetIds.map(assetId => {
      const assetEvents = JSON.parse(JSON.stringify(json));

      assetEvents
        .filter(event => event.content && event.content.idData && event.content.data)
        .map(event => {
          event.content.idData['assetId'] = assetId;
          event.content.idData['createdBy'] = address;
          event.content.idData['dataHash'] = this.assetsService.calculateHash(event.content.data);
          if (!event.content.idData['timestamp']) { event.content.idData['timestamp'] = Math.floor(new Date().getTime() / 1000); }
          if (!event.content.idData['accessLevel']) { event.content.idData['accessLevel'] = 1; }

          event.content['signature'] = this.assetsService.sign(event.content.idData, secret);
        });
      allEvents = allEvents.concat(assetEvents);
    });

    console.log('All events: ', allEvents);

    return allEvents;
  }

  save(input) {
    this.error = false;
    this.success = false;
    let json = {};
    try {
      json = JSON.parse(input.value);
    } catch (e) { }

    if (json) {
      this.spinner = true;

      if (this.for === 'assets' && !this.prefill) {
        // Create asset and info event
        const asset = this.generateAsset();
        const infoEvent = this.generateEvents(json, [asset.assetId]);
        this.assetsCreateSubscription = this.assetsService.createAssets([asset], infoEvent).subscribe(
          (resp: any) => {
            this.spinner = false;
            this.success = 'Success';
            this.sequenceNumber += 1;
          },
          err => {
            this.error = err;
            this.spinner = false;
            console.error('Asset and info event create error: ', err);
          }
        );
      } else {
        // Edit or add events
        const events = this.generateEvents(json);
        this.eventsCreateSubscription = this.assetsService.createEvents(events).subscribe(
          (resp: any) => {
            this.spinner = false;
            this.success = 'Success';
          },
          err => {
            this.error = err;
            this.spinner = false;
            console.error('Events create error: ', err);
          }
        );
      }
    } else {
      this.error = 'Input some valid JSON first';
    }
  }
}
