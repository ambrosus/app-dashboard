/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { JsonPreviewComponent } from 'app/shared/components/json-preview/json-preview.component';

@Component({
  selector: 'app-events-timeline',
  templateUrl: './events-timeline.component.html',
  styleUrls: ['./events-timeline.component.scss'],
})
export class EventsTimelineComponent implements OnInit, OnDestroy {
  eventsSub: Subscription;
  getEventsSub: Subscription;
  events;

  @Input() assetId;
  @Input() name;

  constructor(public assetsService: AssetsService, private authService: AuthService, public dialog: MatDialog) { }

  ngOnInit() {
    this.loadEvents();
    this.eventsSub = this.assetsService._events.subscribe(events => this.events = events);
  }

  ngOnDestroy() {
    if (this.eventsSub) { this.eventsSub.unsubscribe(); }
    if (this.getEventsSub) { this.getEventsSub.unsubscribe(); }
    this.assetsService.unchangedEvents = [];
    this.assetsService._events.next({ results: [] });
  }

  loadEvents(next = '') {
    const token = this.authService.getToken();
    const options = {
      assetId: this.assetId,
      token,
      next,
    };

    this.getEventsSub = this.assetsService.getEvents(options).subscribe();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(JsonPreviewComponent, {
      width: '600px',
      position: { right: '0' },
      data: {
        data: this.assetsService.unchangedEvents,
        name: this.name,
      },
    });

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
