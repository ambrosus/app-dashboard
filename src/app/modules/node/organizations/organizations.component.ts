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
    this.organizationsService.getOrganizations(next).subscribe(
      ({ data }: any) => {
        this.organizations = data.filter(organization => {
          organization.createdOn = moment
            .tz(organization.createdOn * 1000, this.account.timeZone || 'UTC')
            .fromNow();
          return organization.active;
        });
        this.organizationsDisabled = data.filter(
          organization => !organization.active,
        );
        console.log('Organizations: ', this.organizations);
        console.log('Organizations disabled: ', this.organizationsDisabled);
      },
      error => console.error('[GET] Organizations: ', error),
    );
  }

  getOrganizationRequests() {
    this.organizationsService.getOrganizationRequests().subscribe(
      ({ data }: any) => {
        this.organizationRequests = data.map(organizationRequest => {
          organizationRequest.createdOn = moment
            .tz(
              organizationRequest.createdOn * 1000,
              this.account.timeZone || 'UTC',
            )
            .fromNow();
          return organizationRequest;
        });
        console.log('Organization requests: ', this.organizationRequests);
      },
      error => console.error('[GET] Organization requests: ', error),
    );
  }

  actions(action, body: any = {}) {
    switch (action) {
      case 'organizationModify':
        this.organizationsService
          .modifyOrganization(body.organizationId, body.data)
          .subscribe(
            resp => this.getOrganizations(),
            error => console.error('[MODIFY] Organization: ', error),
          );
        break;
      case 'organizationRequest':
        this.organizationsService
          .handleOrganizationRequest(body.id, body.approved)
          .subscribe(
            resp => {
              this.getOrganizations();
              this.getOrganizationRequests();
            },
            error => console.error('[HANDLE] Organization request: ', error),
          );
        break;
    }
  }
}
