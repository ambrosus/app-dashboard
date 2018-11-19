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

@Component({
  selector: 'app-events-timeline',
  templateUrl: './events-timeline.component.html',
  styleUrls: ['./events-timeline.component.scss'],
})
export class EventsTimelineComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  pagination;

  @Input() assetId;
  @Input() name;

  constructor(
    public assetsService: AssetsService,
    private authService: AuthService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadEvents();
    this.subs[this.subs.length] = this.assetsService.events.subscribe(
      ({ pagination }: any) => (this.pagination = pagination),
    );
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
    this.assetsService.events = {
      meta: {},
      data: [],
      pagination: {},
      change: 'reset',
    };
  }

  loadEvents(next = '') {
    const token = this.authService.getToken();
    const options = {
      assetId: this.assetId,
      token,
      next,
    };

    this.assetsService.getEvents(options).then();
  }
}
