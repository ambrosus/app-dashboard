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
  getOrganizationsSub: Subscription;
  getOrganizationRequestsSub: Subscription;
  organizationActionSub: Subscription;
  organizations = [];
  organizationsDisabled = [];
  organizationRequests = [];
  user;
  show = 'active';
  success;
  error;

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
  ) {}

  ngOnInit() {
    this.user = this.storageService.get('user') || {};
    // this.getOrganizations();
    // this.getOrganizationRequests();
  }

  ngOnDestroy() {
    if (this.getOrganizationsSub) {
      this.getOrganizationsSub.unsubscribe();
    }
    if (this.getOrganizationRequestsSub) {
      this.getOrganizationRequestsSub.unsubscribe();
    }
    if (this.organizationActionSub) {
      this.organizationActionSub.unsubscribe();
    }
  }

  getOwnerName(organization) {
    const owner = organization.owner;
    return owner ? owner.full_name || owner.email || 'No name' : 'No owner';
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

  // getOrganizations() {
  //   this.getOrganizationsSub = this.organizationsService.getAll().subscribe(
  //     (organizations: any) => {
  //       this.organizations = organizations.filter(organization => {
  //         organization.createdAt = moment.tz(organization.createdAt, this.user.timeZone).fromNow();
  //         return organization.active;
  //       });
  //       this.organizationsDisabled = organizations.filter(organization => !organization.active);
  //       console.log('Organizations: ', this.organizations);
  //       console.log('Organizations disabled: ', this.organizationsDisabled);
  //     },
  //     err => console.error('Organizations GET error: ', err),
  //   );
  // }

  // getOrganizationRequests() {
  //   this.getOrganizationRequestsSub = this.organizationsService.getOrganizationRequests().subscribe(
  //     (organizationRequests: any) => {
  //       this.organizationRequests = organizationRequests.map(organizationRequest => {
  //         organizationRequest.createdAt = moment.tz(organizationRequest.createdAt, this.user.timeZone).fromNow();
  //         return organizationRequest;
  //       });
  //       console.log('Organization requests: ', this.organizationRequests);
  //     },
  //     err => console.error('Organization Requests GET error: ', err),
  //   );
  // }

  // actions(action, body = {}) {
  //   switch (action) {
  //     case 'organizationEdit':
  //       this.organizationActionSub = this.organizationsService.editOrganization(body['data'], body['organizationID']).subscribe(
  //         resp => this.getOrganizations(),
  //         err => this.error = err.message,
  //       );
  //       break;
  //     case 'organizationRequest':
  //       this.organizationActionSub = this.organizationsService.organizationRequestApproval(body).subscribe(
  //         resp => {
  //           this.getOrganizations();
  //           this.getOrganizationRequests();
  //         },
  //         err => this.error = err.message,
  //       );
  //       break;
  //   }
  // }
}
