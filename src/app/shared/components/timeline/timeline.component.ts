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
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnDestroy {
  eventsSub: Subscription;
  getEventsSub: Subscription;
  events;
  timelineEvents = [];
  unchangedEvents = [];

  @Input() assetId;
  @Input() name;

  constructor(public assetsService: AssetsService, private authService: AuthService, public dialog: MatDialog) { }

  ngOnInit() {
    this.loadEvents();
    this.eventsSub = this.assetsService._events.subscribe(
      events => {
        console.log('[GET] Events: ', events);
        if (events) {
          this.unchangedEvents.concat(JSON.parse(JSON.stringify(events.results)));
          this.events = events;
          this.timelineEvents = this.timelineEvents.concat(...this.assetsService.parseTimelineEvents(this.events));
        }
      },
    );
  }

  ngOnDestroy() {
    if (this.eventsSub) { this.eventsSub.unsubscribe(); }
    if (this.getEventsSub) { this.getEventsSub.unsubscribe(); }
    this.assetsService._events.next(null);
  }

  loadEvents(next = null) {
    const token = this.authService.getToken();
    const options = {
      assetId: this.assetId,
      token,
      next,
    };

    this.getEventsSub = this.assetsService.getEvents(options).subscribe();
  }

  openDialog(): void {
    // TODO: Use data property isntead of componentInstance
    const dialogRef = this.dialog.open(JsonPreviewComponent, {
      width: '600px',
      position: { right: '0' },
      data: {
        data: this.unchangedEvents,
        name: this.name,
      },
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
