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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationsService } from 'app/services/organizations.service';

@Component({
  selector: 'app-initial',
  templateUrl: './initial.component.html',
  styleUrls: ['./initial.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InitialComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private organizationsService: OrganizationsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.subs[this.subs.length] = this.route.queryParams.subscribe(
      ({ inviteId }) => {
        if (inviteId) {
          this.verifyInvite(inviteId);
        }
      },
    );
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  async verifyInvite(inviteId): Promise<any> {
    try {
      const invite = await this.organizationsService.verifyInvite(inviteId);
      this.authService.inviteId = inviteId;
      console.log('[GET] Invite verified: ', invite);
    } catch (error) {
      this.authService.inviteId = '';
      this.router.navigate(['/login']);
    }
  }
}
