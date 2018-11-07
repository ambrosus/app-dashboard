import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssetsService } from 'app/services/assets.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EventComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  routeParamsSub: Subscription;
  assetId;
  eventId;
  event;
  eventObjects = [];

  objectKeys = Object.keys;
  isArray = Array.isArray;
  stringify = JSON.stringify;

  isObject(value) { return typeof value === 'object'; }
  valueJSON(value) { return value.replace(/["{}\[\]]/g, '').replace(/^\s+/m, ''); }

  constructor(
    private route: ActivatedRoute,
    public assetsService: AssetsService,
  ) { }

  ngOnDestroy() {
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.routeParamsSub) { this.routeParamsSub.unsubscribe(); }
  }

  ngOnInit() {
    this.routeSub = this.route.data.subscribe(
      data => this.event = data.event,
      err => console.error('[GET] Event: ', err),
    );
    this.routeParamsSub = this.route.params.subscribe(resp => {
      this.assetId = resp.assetid;
      this.eventId = resp.eventid;
    });

    this.eventObjects = this.assetsService.parseEvent(this.event);
  }
}
