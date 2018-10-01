import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { JsonPreviewComponent } from 'app/shared/components/json-preview/json-preview.component';
import { EventAddComponent } from './../event-add/event-add.component';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  routeParamsSub: Subscription;
  asset;
  assetId: string;
  events;
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
    this.asset['infoEvent'] = this.JSONparse(this.asset.infoEvent);

    this.user = this.storageService.get('user');
    let companySettings: any = {};
    try {
      companySettings = JSON.parse(this.user.company.settings);
    } catch (e) { }
    this.previewAppUrl = companySettings.preview_app || 'https://amb.to';
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

  getName(eventObject, alternative = '') {
    try {
      const obj = JSON.parse(eventObject);
      const name = obj.name;
      const type = obj.type.split('.');
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

  openCreateEventDialog() {
    const dialogRef = this.dialog.open(EventAddComponent, {
      width: '600px',
      position: { right: '0' }
    });

    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
    const instance = dialogRef.componentInstance;
    instance.prefill = this.events;
    instance.assetIds = [this.assetId];
  }

  openJsonDialog(): void {
    const dialogRef = this.dialog.open(JsonPreviewComponent, {
      width: '600px',
      position: { right: '0' }
    });
    const instance = dialogRef.componentInstance;
    instance.data = this.events;
    instance.name = this.getName(this.asset.infoEvent, 'No title');

    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }
}
