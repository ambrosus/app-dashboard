import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetComponent implements OnInit {
  asset;
  assetId: string;
  createEvents = false;
  hostLink = 'amb.to';
  jsonEvents;
  json = false;
  events;

  objectKeys = Object.keys;
  stringify = JSON.stringify;

  constructor(
    private route: ActivatedRoute,
    private assetService: AssetsService,
    private storage: StorageService
  ) {}

  isObject(value) {
    return typeof value === 'object';
  }

  syntaxHighlight(json) {
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,

      function(match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }

  valueJSON(value) {
    return value.replace(/["{}\[\]]/g, '').replace(/^\s+/m, '');
  }

  exportJSON() {
    const filename = this.asset.info.name || this.asset.timestamp;
    const copy = [];
    this.jsonEvents.map(obj => {
      copy.push(JSON.parse(JSON.stringify(obj)));
    });
    copy.map(obj => {
      obj.content.idData.assetId = '{{assetId}}';
      obj.content.idData.createdBy = '{{userAddress}}';
      delete obj.eventId;
      delete obj.metadata;
      delete obj.content.idData.dataHash;
      delete obj.content.signature;
    });
    const data = this.stringify(copy, null, 3);
    const blob = new Blob([data], { type: 'application/json' });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  openCreateEvent() {
    this.assetService.unselectAssets();
    this.assetService.selectAsset(this.assetId);
    this.createEvents = true;
  }

  ngOnInit() {
    if (this.storage.environment === 'dev') {
      this.hostLink = 'angular-amb-to-stage.herokuapp.com';
    }

    // Get asset data
    this.route.data.subscribe(
      data => {
        this.asset = data.asset;
      },
      err => {
        console.log('err ', err);
      }
    );

    this.route.params.subscribe(params => {
      this.assetId = params.assetid;

      this.assetService.getEventsAll(params.assetid).subscribe(
        resp => {
          this.events = resp;
        },
        err => {
          console.log('Events get error: ', err);
        }
      );

      // Events for export
      this.assetService
        .getEvents(params.assetid)
        .then((resp: any) => {
          this.jsonEvents = resp.results;
        })
        .catch(err => {
          console.log('Events get error: ', err);
        });
    });
  }
}
