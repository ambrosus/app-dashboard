import { AssetsService } from 'app/services/assets.service';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministrationService } from '../../../services/administration.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventComponent implements OnInit, OnDestroy {
  hostLink = 'amb.to';
  json = false;
  event;
  jsonEvent = [];
  edit = false;
  assetId;
  eventId;
  infoEvent = false;
  previewAppUrl;


  objectKeys = Object.keys;
  stringify = JSON.stringify;
  isArray(value) {
    return value instanceof Array;
  }

  constructor(private route: ActivatedRoute,
              private assetService: AssetsService,
              private router: Router,
              private administration: AdministrationService) {}

  downloadQR(el: any) {
    const data = el.elementRef.nativeElement.children[0].src;
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

  isObject(value) {
    return typeof value === 'object';
  }

  hasInfoEvent() {
    const event = this.event || null;
    return event ? this.event.content.data.some(obj => obj.type === 'ambrosus.asset.info') : false;
  }

  valueJSON(value) {
    return value.replace(/["{}\[\]]/g, '').replace(/^\s+/m, '');
  }

  ngOnInit() {
    // Get event data
    this.route.data.subscribe(
      data => {
        this.event = data.event;
        this.assetId = this.event.content.idData.assetId || '';
        this.eventId = this.event.eventId || '';
        this.infoEvent = this.hasInfoEvent();
        this.jsonEvent.push(data.event);
      },
      err => {
        console.log('err ', err);
      }
    );
    // New info event created from edit
    this.assetService.infoEventCreated.subscribe(
      (resp: any) => {
        const url = `/assets/${resp.data.content.idData.assetId}/events/${resp.data.eventId}`;
        if (location.pathname.indexOf('/events/') > -1) {
          this.router.navigate([url]);
        }
      }
    );
    // New other event created from edit
    this.assetService.eventAdded.subscribe(
      (resp: any) => {
        const url = `/assets/${resp.data.content.idData.assetId}/events/${resp.data.eventId}`;
        if (location.pathname.indexOf('/events/') > -1) {
          this.router.navigate([url]);
        }
      }
    );

    this.previewAppUrl = this.administration.previewAppUrl;
  }

  ngOnDestroy() {
    this.assetService.unselectAssets();
  }
}
