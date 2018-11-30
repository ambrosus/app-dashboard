import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

interface Organization {
  _id?: string;
  owner?: string;
  title?: string;
  timeZone?: string;
  active?: boolean;
  legalAddress?: string;
  createdOn?: number;
  createdBy?: string;
  organizationId?: number;
  modifiedBy?: string;
  modifiedOn?: number;
}

interface OrganizationRequest {
  title: string;
  address: string;
  email: string;
  message: string;
}

@Injectable()
export class OrganizationsService {
  api;

  constructor(private http: HttpClient) {
    this.api = environment.api;
  }

  to(O: Observable<any>) {
    return O.toPromise()
      .then(response => response)
      .catch(error => ({ error }));
  }

  async getOrganizations(next: string = ''): Promise<any> {
    const url = `${this.api.extended}/organization?next=${next}`;

    const organizations = await this.to(this.http.get(url));
    if (organizations.error) {
      throw new Error(organizations.error);
    }

    return organizations.data;
  }

  async getOrganization(organizationId: number): Promise<any> {
    const url = `${this.api.extended}/organization/${organizationId}`;

    const organization = await this.to(this.http.get(url));
    if (organization.error) {
      throw new Error(organization.error);
    }

    return organization.data;
  }

  async modifyOrganization(organizationId: number, body: Organization): Promise<any> {
    const url = `${this.api.extended}/organization/${organizationId}`;

    const organization = await this.to(this.http.put(url, body));
    if (organization.error) {
      throw new Error(organization.error);
    }

    return organization.data;
  }

  async getOrganizationAccounts(organizationId: number): Promise<any> {
    const url = `${this.api.extended}/organization/${organizationId}/accounts`;

    const accounts = await this.to(this.http.get(url));
    if (accounts.error) {
      throw new Error(accounts.error);
    }

    return accounts.data;
  }

  // Organization requests

  async createOrganizationRequest(body: OrganizationRequest): Promise<any> {
    const url = `${this.api.extended}/organization/request`;

    const organizationRequest = await this.to(this.http.post(url, body));
    if (organizationRequest.error) {
      throw new Error(organizationRequest.error);
    }

    return organizationRequest.data;
  }

  async getOrganizationRequests(next: string = ''): Promise<any> {
    const url = `${this.api.extended}/organization/request?next=${next}`;

    const organizationRequests = await this.to(this.http.get(url));
    if (organizationRequests.error) {
      throw new Error(organizationRequests.error);
    }

    return organizationRequests.data;
  }

  async getOrganizationRequestsDeclined(next: string = ''): Promise<any> {
    const url = `${this.api.extended}/organization/request/refused?next=${next}`;

    const organizationRequests = await this.to(this.http.get(url));
    if (organizationRequests.error) {
      throw new Error(organizationRequests.error);
    }

    return organizationRequests.data;
  }

  async handleOrganizationRequest(organizationRequestId: string, approved: boolean): Promise<any> {
    const url = `${this.api.extended}/organization/request/${organizationRequestId}/${approved ? 'approve' : 'refuse'}`;

    const organizationRequest = await this.to(this.http.get(url));
    if (organizationRequest.error) {
      throw new Error(organizationRequest.error);
    }

    return organizationRequest.data;
  }

  // Organization invites

  async getInvites(next: string = ''): Promise<any> {
    const url = `${this.api.extended}/organization/invite?next=${next}`;

    const invites = await this.to(this.http.get(url));
    if (invites.error) {
      throw new Error(invites.error);
    }

    return invites.data;
  }

  async createInvites(body: { email: any[] }): Promise<any> {
    const url = `${this.api.extended}/organization/invite`;

    const invites = await this.to(this.http.post(url, body));
    if (invites.error) {
      throw new Error(invites.error);
    }

    return invites.data;
  }

  async resendInvites(body: { email: any[] }): Promise<any> {
    const url = `${this.api.extended}/organization/invite/resend`;

    const invites = await this.to(this.http.post(url, body));
    if (invites.error) {
      throw new Error(invites.error);
    }

    return invites.data;
  }

  async verifyInvite(inviteId: string): Promise<any> {
    const url = `${this.api.extended}/organization/invite/${inviteId}/exists`;

    const invite = await this.to(this.http.get(url));
    if (invite.error) {
      throw new Error(invite.error);
    }

    return invite.data;
  }

  async acceptInvite(inviteId: string, body: { address: string }): Promise<any> {
    const url = `${this.api.extended}/organization/invite/${inviteId}/accept`;

    const invite = await this.to(this.http.post(url, body));
    if (invite.error) {
      throw new Error(invite.error);
    }

    return invite.data;
  }

  async deleteInvite(inviteId: string): Promise<any> {
    const url = `${this.api.extended}/organization/invite/${inviteId}`;

    const invite = await this.to(this.http.delete(url));
    if (invite.error) {
      throw new Error(invite.error);
    }

    return invite.data;
  }
}
