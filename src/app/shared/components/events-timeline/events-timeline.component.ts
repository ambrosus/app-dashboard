/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-events-timeline',
  templateUrl: './events-timeline.component.html',
  styleUrls: ['./events-timeline.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EventsTimelineComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  pagination;

  @Input() assetId;
  @Input() name;

  constructor(
    public assetsService: AssetsService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.loadEvents();
    this.subs[this.subs.length] = this.assetsService.events.subscribe(
      ({ pagination }: any) => this.pagination = pagination,
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
