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
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnDestroy {
  eventsSub: Subscription;
  eventsResultsSub: Subscription;
  events = [];
  unchangedEvents = [];

  @Input() data;
  @Input() assetId;
  @Input() name;

  constructor(private assetsService: AssetsService, private authService: AuthService, private el: ElementRef, public dialog: MatDialog) { }

  ngOnInit() {
    this.loadEvents = this.loadEvents.bind(this);
    this.loadEvents();
  }

  ngOnDestroy() {
    if (this.eventsSub) { this.eventsSub.unsubscribe(); }
    if (this.eventsResultsSub) { this.eventsResultsSub.unsubscribe(); }
  }

  loadEvents(page = 0, perPage = 15) {
    const token = this.authService.getToken();
    const options = { assetId: encodeURI(`assetId=${this.assetId}`), token, page, perPage };

    this.eventsResultsSub = this.assetsService._events.subscribe(
      events => {
        this.unchangedEvents = JSON.parse(JSON.stringify(events.results));
        this.events = this.assetsService.parseTimelineEvents(events).events;
      }
    );

    this.eventsSub = this.assetsService.getEvents(options).subscribe(
      (resp: any) => {
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
      position: { right: '0' },
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
