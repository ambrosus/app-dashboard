import { AssetAddComponent } from './../asset-add/asset-add.component';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EventAddComponent } from './../event-add/event-add.component';
import { JsonPreviewComponent } from 'app/shared/components/json-preview/json-preview.component';
import { StorageService } from 'app/services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EventComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  routeParamsSub: Subscription;
  previewAppUrl;
  assetId;
  eventId;
  user;
  event;
  edit = false;
  infoEvent = {};

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

  ngOnDestroy() {
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.routeParamsSub) { this.routeParamsSub.unsubscribe(); }
  }

  ngOnInit() {
    this.routeSub = this.route.data.subscribe(
      data => this.event = data.event,
      err => console.log('Event GET error: ', err)
    );
    this.routeParamsSub = this.route.params.subscribe(resp => {
      if (resp.edit && resp['edit'] === 'true') { this.edit = true; }
      this.assetId = resp.assetid;
      this.eventId = resp.eventid;
    });
    this.infoEvent = this.findInfoEvent();

    this.user = this.storageService.get('user');
    let companySettings: any = {};
    try {
      companySettings = JSON.parse(this.user.company.settings);
    } catch (e) { }
    this.previewAppUrl = companySettings.preview_app || 'https://amb.to';
  }

  downloadQR(el: any) {
    const data = el.el.nativeElement.children[0].src;
    const filename = `QR_code_${this.event.content.idData.assetId}_${
      this.event.eventId
      }.png`;
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

  findInfoEvent() { return this.event && this.event.content && this.event.content.data ? this.event.content.data.find(obj => obj.type === 'ambrosus.asset.info') : {}; }

  getName(obj, alternative = '') {
    try {
      const name = obj.name;
      const type = obj.type.split('.');
      return name ? name : type[type.length - 1];
    } catch (e) { return alternative; }
  }

  openDialog() {
    if (this.infoEvent) {
      return this.openAssetEditDialog();
    } else { return this.openEditDialog(); }
  }

  openJSONPreviewDialog(): void {
    const dialogRef = this.dialog.open(JsonPreviewComponent, {
      width: '600px',
      position: { right: '0' },
    });
    const instance = dialogRef.componentInstance;
    instance.data = [this.event];
    instance.name = this.getName(this.infoEvent, 'No title');
    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }

  openAssetEditDialog() {
    const dialogRef = this.dialog.open(AssetAddComponent, {
      width: '600px',
      position: { right: '0' },
    });
    const instance = dialogRef.componentInstance;
    instance.assetIds = [this.assetId];
    instance.isDialog = true;
    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(EventAddComponent, {
      width: '600px',
      position: { right: '0' },
    });
    const instance = dialogRef.componentInstance;
    instance.assetIds = [this.assetId];
    instance.isDialog = true;
    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }
}
