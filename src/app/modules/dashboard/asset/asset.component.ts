import { StorageService } from './../../../services/storage.service';
import { AssetsService } from './../../../services/assets.service';
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
  json = false;

  objectKeys = Object.keys;
  expandEvents = [];
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
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  valueJSON(value) {
    return value
      .replace(/"/g, '')
      .replace(/{/g, '')
      .replace(/}/g, '');
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

    this.route.params.subscribe(params => {
      this.assetId = params.assetid;
    });

    this.route.data.subscribe(
      data => {
        this.asset = data.asset;
        console.log(this.asset);
      },
      err => {
        console.log('err ', err);
      }
    );
  }
}
