import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { EventAddComponent } from './../event-add/event-add.component';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  routeParamsSub: Subscription;
  asset;
  assetId: string;
  user;
  previewAppUrl;

  objectKeys = Object.keys;
  isArray = Array.isArray;
  stringify = JSON.stringify;

  isObject(value) { return typeof value === 'object'; }
  valueJSON(value) { return value.replace(/["{}\[\]]/g, '').replace(/^\s+/m, ''); }

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.routeSub = this.route.data.subscribe(data => this.asset = data.asset);
    this.routeParamsSub = this.route.params.subscribe(params => this.assetId = params.assetid);

    this.user = <any>this.storageService.get('user') || {};
    try {
      this.asset['infoEvent'] = this.JSONparse(this.asset.infoEvent);
      this.previewAppUrl = this.user.company.settings.preview_app;
    } catch (e) {
      this.asset['infoEvent'] = {};
      this.previewAppUrl = 'https://amb.to';
    }

    // Groups and properties
    this.asset.infoEvent['groups'] = [];
    this.asset.infoEvent['properties'] = [];
    Object.keys(this.asset.infoEvent).map((key: any) => {
      if (['type', 'name', 'assetType', 'images', 'eventId', 'createdBy', 'timestamp', 'location', 'identifiers', 'groups', 'properties'].indexOf(key) === -1) {
        const property = {
          key,
          value: this.asset.infoEvent[key],
        };
        this.asset.infoEvent[typeof property.value === 'string' || Array.isArray(property.value) ? 'properties' : 'groups'].push(property);
      }
    });

    console.log(3, this.asset);
  }

  ngOnDestroy() {
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.routeParamsSub) { this.routeParamsSub.unsubscribe(); }
  }

  JSONparse(value) {
    try {
      return JSON.parse(value);
    } catch (e) { return false; }
  }

  getName(info, alternative = '') {
    try {
      const name = info.name;
      const type = info.type.split('.');
      return name ? name : type[type.length - 1];
    } catch (e) { return alternative; }
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
    const dialogRef = this.dialog.open(EventAddComponent, {
      width: '600px',
      position: { right: '0' },
    });

    dialogRef.afterClosed().subscribe(result => console.log('Event add dialog was closed'));
    const instance = dialogRef.componentInstance;
  }
}
