import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssetsService } from 'app/services/assets.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  location: any = false;

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
  ) { }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.subs[this.subs.length] = this.route.data.subscribe(
      data => {
        console.log('Event: ', data);
        this.event = data.event;
        try {
          this.location = {
            lat: this.event.info.location.geoJson ? this.event.info.location.geoJson.coordinates[0] : this.event.info.location.location.geometry.coordinates[0],
            lng: this.event.info.location.geoJson ? this.event.info.location.geoJson.coordinates[0] : this.event.info.location.location.geometry.coordinates[0],
          };
          delete this.event.info.location.type;
          delete this.event.info.location.location;
          delete this.event.info.location.geoJson;
        } catch (e) { }
      },
      err => console.error('Event: ', err),
    );
    this.subs[this.subs.length] = this.route.params.subscribe(resp => {
      this.assetId = resp.assetid;
      this.eventId = resp.eventid;
    });
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }
}
