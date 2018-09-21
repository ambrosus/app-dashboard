/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, Input, ElementRef, OnDestroy } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {
  eventsSubscription: Subscription;
  events = [];
  // Pagination
  perPage = 15;
  currentEventsPage = 1;
  totalEventsPages = 0;
  resultCountEvents;
  currentSearchPage = 1;
  totalSearchPages = 0;
  resultCountSearch;
  searchActive = false;
  // Other
  searchPlaceholder = 'ie. ambrosus.asset.sold';
  showSearch = false;

  @Input() data;
  @Input() assetId;
  @Input() name;

  constructor(private assetsService: AssetsService, private auth: AuthService, private el: ElementRef) { }

  ngOnInit() {
    this.loadEvents = this.loadEvents.bind(this);
    this.loadEvents();
  }

  ngOnDestroy() {
    if (this.eventsSubscription) { this.eventsSubscription.unsubscribe(); }
  }

  loadEvents(page = 0, s = false) {
    const token = this.auth.getToken();
    const options = { assetId: encodeURI(`assetId=${this.assetId}`), token };

    if (s) {
      const search = this.el.nativeElement.querySelector('#search').value;
      const select = this.el.nativeElement.querySelector('#select').value;
      this.searchActive = true;
      if (search.length === 0) { return this.loadEvents(); }
      const searchValues = search.split(',');
      switch (select) {
        case 'type':
          options['data'] = `data[type]=${searchValues[0].trim()}`;
          break;
      }
    } else {
      this.searchActive = false;
    }

    this.eventsSubscription = this.assetsService.getEvents(options).subscribe(
      (resp: any) => {
        console.log(resp);
        this.events = resp.events;
        if (!s) {
          this.resultCountEvents = resp.resultCount;
          this.totalEventsPages = Math.ceil(this.resultCountEvents / this.perPage);
        } else {
          this.resultCountSearch = resp.resultCount;
          this.totalSearchPages = Math.ceil(this.resultCountSearch / this.perPage);
        }
      },
      err => {
        this.events = [];
        console.log('Events GET failed: ', err);
      }
    );
  }
}
