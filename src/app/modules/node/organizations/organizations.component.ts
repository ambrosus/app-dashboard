import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { OrganizationsService } from 'app/services/organizations.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  organizations = [];
  organizationsDisabled = [];
  organizationRequests = [];
  account;
  show = 'active';
  success;
  error;

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
  ) {}

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.getOrganizations();
    this.getOrganizationRequests();
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  getNumberOfOrganizations() {
    switch (this.show) {
      case 'active':
        return this.organizations.length;
      case 'pending':
        return this.organizationRequests.length;
      case 'disabled':
        return this.organizationsDisabled.length;
    }
  }

  getOrganizations(next = '') {
    this.organizationsService
      .getOrganizations(next)
      .then((organizations: any) => {
        this.organizations = organizations.filter(organization => {
          organization.createdOn = moment
            .tz(organization.createdOn, this.account.timeZone || 'UTC')
            .fromNow();
          return organization.active;
        });
        this.organizationsDisabled = organizations.filter(
          organization => !organization.active,
        );
        console.log('Organizations: ', this.organizations);
        console.log('Organizations disabled: ', this.organizationsDisabled);
      })
      .catch(err => console.error('[GET] Organizations: ', err));
  }

  getOrganizationRequests() {
    this.organizationsService
      .getOrganizationRequests()
      .then((organizationRequests: any) => {
        this.organizationRequests = organizationRequests.map(
          organizationRequest => {
            organizationRequest.createdOn = moment
              .tz(organizationRequest.createdOn, this.account.timeZone || 'UTC')
              .fromNow();
            return organizationRequest;
          },
        );
        console.log('Organization requests: ', this.organizationRequests);
      })
      .catch(err => console.error('[GET] Organization requests: ', err));
  }

  actions(action, body: any = {}) {
    switch (action) {
      case 'organizationModify':
        this.organizationsService
          .modifyOrganization(body.organizationId, body.data)
          .then(resp => this.getOrganizations())
          .catch(err => console.error('[MODIFY] Organization: ', err));
        break;
      case 'organizationRequest':
        this.organizationsService
          .handleOrganizationRequest(body.id, body.approved)
          .then(resp => {
            this.getOrganizations();
            this.getOrganizationRequests();
          })
          .catch(err => console.error('[HANDLE] Organization request: ', err));
        break;
    }
  }
}
