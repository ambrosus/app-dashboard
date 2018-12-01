import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { EventAddComponent } from './../event-add/event-add.component';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { AssetsService } from 'app/services/assets.service';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  asset: any = {};
  assetId: string;
  timeline;
  dialogRef;
  json: any = '';
  jsonEventsRaw: any;
  jsonEvents: any;

  objectKeys = Object.keys;
  isArray = Array.isArray;
  stringify = JSON.stringify;

  isObject(value) {
    return typeof value === 'object';
  }
  valueJSON(value) {
    return value.replace(/["{}\[\]]/g, '').replace(/^\s+/m, '');
  }

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    public assetsService: AssetsService,
    public dialog: MatDialog,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.subs[this.subs.length] = this.route.data.subscribe(
      ({ asset }: any) => {
        console.log('Asset: ', asset);
        this.asset = asset;
      },
    );
    this.subs[this.subs.length] = this.route.params.subscribe(
      ({ assetid }: any) => this.assetId = assetid,
    );
    this.subs[this.subs.length] = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
    this.assetsService.events.subscribe(
      events => (this.timeline = events && events.data && events.data.length),
    );
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  async viewJSON() {
    if (this.json) { return this.json = ''; }
    this.json = 'View as Data';
    if (this.jsonEvents) { return this.jsonEvents; }
    try {
      this.jsonEventsRaw = await this.assetsService.getMaxEvents({ assetId: this.assetId, limit: 200 });
      this.jsonEvents = JSON.stringify(this.jsonEventsRaw.data, null, 2);
    } catch (error) {
      console.error('[GET] Max events: ', error);
    }
  }

  downloadJSON() {
    const url =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(this.jsonEvents);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  JSONparse(value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return false;
    }
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
    this.dialogRef = this.dialog.open(EventAddComponent, {
      panelClass: 'dialog',
      data: {
        assetIds: [this.assetId],
      },
    });

    this.dialogRef
      .afterClosed()
      .subscribe(result => console.log('Event add dialog was closed'));
  }
}
