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
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { OrganizationsService } from 'app/services/organizations.service';
import * as moment from 'moment-timezone';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MessageService } from 'app/services/message.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  organizations = [];
  organizationsDisabled = [];
  organizationRequests = [];
  organizationRequestsDeclined = [];
  account: any = {};
  show = 'all';
  self = this;

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.actions = this.actions.bind(this);
    this.getOrganizations().then();
    this.getOrganizationRequests().then();
    this.getOrganizationRequestsDeclined().then();
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  async getOrganizations(next = ''): Promise<any> {
    try {
      const organizations = await this.organizationsService.getOrganizations(next);
      this.organizations = organizations.filter(organization => {
        organization.createdOn = moment.tz(organization.createdOn * 1000, this.account.timeZone || 'UTC').fromNow();
        return organization.active;
      });
      this.organizationsDisabled = organizations.filter(organization => !organization.active);
      console.log('[GET] Organizations: ', this.organizations);
      console.log('[GET] Organizations disabled: ', this.organizationsDisabled);

    } catch (error) {
      console.error('[GET] Organizations: ', error);
      this.messageService.error(error);
    }
  }

  async getOrganizationRequests(next = ''): Promise<any> {
    try {
      this.organizationRequests = await this.organizationsService.getOrganizationRequests(next);
      this.organizationRequests = this.organizationRequests.filter(organizationRequest => {
        organizationRequest.createdOn = moment.tz(organizationRequest.createdOn * 1000, this.account.timeZone || 'UTC')
          .fromNow();
        return organizationRequest;
      });
      console.log('[GET] Organization requests: ', this.organizationRequests);
    } catch (error) {
      console.error('[GET] Organization requests: ', error);
      this.messageService.error(error);
    }
  }

  async getOrganizationRequestsDeclined(next = ''): Promise<any> {
    try {
      this.organizationRequestsDeclined = await this.organizationsService.getOrganizationRequestsDeclined(next);
      this.organizationRequestsDeclined = this.organizationRequestsDeclined.filter(organizationRequest => {
        organizationRequest.createdOn = moment.tz(organizationRequest.createdOn * 1000, this.account.timeZone || 'UTC')
          .fromNow();
        return organizationRequest;
      });
      console.log('[GET] Organization requests declined: ', this.organizationRequestsDeclined);
    } catch (error) {
      console.error('[GET] Organization requests declined: ', error);
      this.messageService.error(error);
    }
  }

  async actions(...args): Promise<any> {
    switch (args[0]) {
      case 'organizationModify':
        try {
          console.log('modify');
          await this.organizationsService.modifyOrganization(args[1].id, args[1].data);
          await this.getOrganizations();

          this.messageService.success('Organization modified');
        } catch (error) {
          console.error('[MODIFY] Organization: ', error);
          this.messageService.error(error);
        }
        break;
      case 'organizationRequest':
        try {
          await this.organizationsService.handleOrganizationRequest(args[1].id, args[1].approved);
          await this.getOrganizations();
          await this.getOrganizationRequests();
          await this.getOrganizationRequestsDeclined();

          this.messageService.success(`Organization request ${args[1].approved ? 'approved' : 'declined'}`);
        } catch (error) {
          console.error('[HANDLE] Organization request: ', error);
          this.messageService.error(error);
        }
        break;
    }
  }
}
