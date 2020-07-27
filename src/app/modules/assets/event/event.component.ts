import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssetsService } from 'app/services/assets.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialogRef, MatDialog } from '@angular/material';
import { EventAddComponent } from '../event-add/event-add.component';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EventComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  assetId;
  eventId;
  event;
  eventPrefill;
  location: any = false;
  noContent = false;
  properties: any = [];
  raws: any = [];
  encryption;
  dialogs: {
    event?: MatDialogRef<any>,
  } = {};

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
    public assetsService: AssetsService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
  ) {
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.subs[this.subs.length] = this.assetsService.event.subscribe(
      event => {
        console.log('Event: ', event);

        this.event = event;
        const { info } = event;
        this.eventPrefill = JSON.parse(JSON.stringify(event));

        console.log('Event prefill: ', this.eventPrefill);

        if (info) {
          if (
            !info.images &&
            !info.rows &&
            !info.description &&
            !info.documents &&
            !(info.identifiers && info.identifiers.identifiers) &&
            !(info.properties && info.properties.length) &&
            !(info.groups && info.groups.length)
          ) {
            this.noContent = true;
          } else if (info.properties.length) {
            this.properties = info.properties.filter(prop => prop.key !== 'raws' && prop.key !== 'description' && prop.key !== 'encryption' );

            const raws = info.properties.find(prop => prop.key === 'raws' );
            const encryption = info.properties.find(prop => prop.key === 'encryption' );

            this.raws = raws ? raws.value : [];
            this.encryption = encryption ? encryption.value : 'off';
          }

          if (this.raws) {
            this.raws.forEach(raw => {
              raw.data = this.sanitizer.bypassSecurityTrustUrl(raw.data);
            });
          }
        }

        try {
          this.location = {
            lat: info.location.geoJson ? info.location.geoJson.coordinates[0] : info.location.location.geometry.coordinates[0],
            lng: info.location.geoJson ? info.location.geoJson.coordinates[1] : info.location.location.geometry.coordinates[1],
          };
          delete info.location.type;
          delete info.location.location;
          delete info.location.geoJson;
        } catch (e) {
        }
      },
      err => console.error('Event: ', err),
    );

    this.subs[this.subs.length] = this.assetsService.progress.status.start.subscribe(next => {
      Object.keys(this.dialogs).map(key => this.dialogs[key].close());
    });

    this.subs[this.subs.length] = this.route.params.subscribe(resp => {
      this.assetId = resp.assetid;
      this.eventId = resp.eventid;
    });
  }

  editEvent() {
    this.dialogs.event = this.dialog.open(EventAddComponent, {
      panelClass: 'dialog',
      disableClose: true,
      data: {
        assetIds: [this.assetId],
        prefill: this.eventPrefill,
        for: 'events',
      },
    });
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }
}
