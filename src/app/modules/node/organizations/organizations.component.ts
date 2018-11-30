import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { OrganizationsService } from 'app/services/organizations.service';
import * as moment from 'moment-timezone';
import { ViewEncapsulation } from '@angular/compiler/src/core';

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
    }
  }

  async actions(...args): Promise<any> {
    switch (args[0]) {
      case 'organizationModify':
        try {
          console.log('modify');
          await this.organizationsService.modifyOrganization(args[1].id, args[1].data);
          await this.getOrganizations();
        } catch (error) {
          console.error('[MODIFY] Organization: ', error);
        }
        break;
      case 'organizationRequest':
        try {
          await this.organizationsService.handleOrganizationRequest(args[1].id, args[1].approved);
          await this.getOrganizations();
          await this.getOrganizationRequests();
          await this.getOrganizationRequestsDeclined();
        } catch (error) {
          console.error('[HANDLE] Organization request: ', error);
        }
        break;
    }
  }
}
