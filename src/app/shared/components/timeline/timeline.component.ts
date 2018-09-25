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
import { MatDialog } from '@angular/material/dialog';
import { JsonPreviewComponent } from 'app/shared/components/json-preview/json-preview.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {
  eventsSubscription: Subscription;
  events = [];
  unchangedEvents = [];
  // Pagination
  pagination = {
    currentPage: 0,
    perPage: 15,
    totalPages: 0,
    resultCount: 0,
    resultLength: 0
  };
  searchActive = false;
  // Other
  searchPlaceholder = 'ie. ambrosus.asset.sold';
  showSearch = false;

  @Input() data;
  @Input() assetId;
  @Input() name;

  constructor(private assetsService: AssetsService, private auth: AuthService, private el: ElementRef, public dialog: MatDialog) { }

  ngOnInit() {
    this.loadEvents = this.loadEvents.bind(this);
    this.loadEvents();
  }

  ngOnDestroy() {
    if (this.eventsSubscription) { this.eventsSubscription.unsubscribe(); }
  }

  loadEvents(page = 0, perPage = 15) {
    const token = this.auth.getToken();
    const options = { assetId: encodeURI(`assetId=${this.assetId}`), token };
    this.searchActive = false;

    this.eventsSubscription = this.assetsService.getEvents(options).subscribe(
      (resp: any) => {
        this.unchangedEvents = JSON.parse(JSON.stringify(resp.results));
        this.events = this.assetsService.parseTimelineEvents(resp).events;
        this.pagination.currentPage = page;
        this.pagination.perPage = perPage;
        this.pagination.resultCount = resp.resultCount;
        this.pagination.resultLength = resp.results.length;
        this.pagination.totalPages = Math.ceil(resp.resultCount / perPage);
      },
      err => {
        this.events = [];
        console.log('Events GET failed: ', err);
      }
    );
  }

  search(page = 0, perPage = 15) {
    const search = this.el.nativeElement.querySelector('#search').value;
    const select = this.el.nativeElement.querySelector('#select').value;
    this.searchActive = true;

    if (search.length === 0) { return this.loadEvents(); }

    const token = this.auth.getToken();
    const options = { assetId: encodeURI(`assetId=${this.assetId}`), token };

    const searchValues = search.split(',');
    switch (select) {
      case 'type':
        options['data'] = `data[type]=${searchValues[0].trim()}`;
        break;
    }

    this.eventsSubscription = this.assetsService.getEvents(options).subscribe(
      (resp: any) => {
        this.unchangedEvents = JSON.parse(JSON.stringify(resp.results));
        this.events = this.assetsService.parseTimelineEvents(resp).events;
        this.pagination.currentPage = page;
        this.pagination.perPage = perPage;
        this.pagination.resultCount = resp.resultCount;
        this.pagination.resultLength = resp.results.length;
        this.pagination.totalPages = Math.ceil(resp.resultCount / perPage);
      },
      err => {
        this.events = [];
        console.log('Events GET failed: ', err);
      }
    );
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(JsonPreviewComponent, {
      width: '600px',
      position: { right: '0' }
    });
    const instance = dialogRef.componentInstance;
    instance.data = this.unchangedEvents;
    instance.name = this.name;
    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }

  bulkActions(action) {
    switch (action.value) {
      case 'exportEvents':
        this.openDialog();
        break;
    }

    action.value = 'default';
  }
}
