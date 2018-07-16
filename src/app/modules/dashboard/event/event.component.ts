import { AssetsService } from 'app/services/assets.service';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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


  objectKeys = Object.keys;
  stringify = JSON.stringify;
  isArray(value) {
    return value instanceof Array;
  }

  constructor(private route: ActivatedRoute,
              private assetService: AssetsService,
              private router: Router) {}

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

  downloadJSON() {
    const filename =
      this.event.content.data[0].name || this.event.content.idData.timestamp;
    const copy = [];
    this.jsonEvent.map(obj => {
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
  }

  ngOnDestroy() {
    this.assetService.unselectAssets();
  }
}
