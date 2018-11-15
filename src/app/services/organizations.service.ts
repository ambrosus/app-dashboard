import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Organization {
  _id?: String;
  owner?: String;
  title?: String;
  timeZone?: String;
  active?: Boolean;
  legalAddress?: String;
  createdOn?: Number;
  createdBy?: String;
  organizationId?: Number;
  modifiedBy?: String;
  modifiedOn?: Number;
}

interface OrganizationRequest {
  title: String;
  address: String;
  email: String;
  message: String;
}

@Injectable()
export class OrganizationsService {
  api;

  constructor(private http: HttpClient) {
    this.api = environment.api;
  }

  getOrganizations(next: String = ''): Observable<any> {
    const url = `${this.api.extended}/organization?next=${next}`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  getOrganization(organizationId: Number): Observable<any> {
    const url = `${this.api.extended}/organization/${organizationId}`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  modifyOrganization(
    organizationId: Number,
    body: Organization,
  ): Observable<any> {
    const url = `${this.api.extended}/organization/${organizationId}`;

    return this.http.put(url, body).pipe(catchError(({ meta }: any) => meta));
  }

  getOrganizationAccounts(organizationId: Number): Observable<any> {
    const url = `${this.api.extended}/organization/${organizationId}/accounts`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  // Organization requests

  createOrganizationRequest(body: OrganizationRequest): Observable<any> {
    const url = `${this.api.extended}/organization/request`;

    return this.http.post(url, body).pipe(catchError(({ meta }: any) => meta));
  }

  getOrganizationRequests(next: String = ''): Observable<any> {
    const url = `${this.api.extended}/organization/request?next=${next}`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  handleOrganizationRequest(
    organizationRequestId: String,
    approved: Boolean,
  ): Observable<any> {
    const url = `${
      this.api.extended
    }/organization/request/${organizationRequestId}/${
      approved ? 'approve' : 'refuse'
    }`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  // Organization invites

  getInvites(next: String = ''): Observable<any> {
    const url = `${this.api.extended}/organization/invite?next=${next}`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  createInvites(body: { email: any[] }): Observable<any> {
    const url = `${this.api.extended}/organization/invite`;

    return this.http.post(url, body).pipe(catchError(({ meta }: any) => meta));
  }

  resendInvites(body: { email: any[] }): Observable<any> {
    const url = `${this.api.extended}/organization/invite/resend`;

    return this.http.post(url, body).pipe(catchError(({ meta }: any) => meta));
  }

  verifyInvite(inviteId: String): Observable<any> {
    const url = `${this.api.extended}/organization/invite/${inviteId}/exists`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  acceptInvite(inviteId: String, body: { address: String }): Observable<any> {
    const url = `${this.api.extended}/organization/invite/${inviteId}/accept`;

    return this.http.post(url, body).pipe(catchError(({ meta }: any) => meta));
  }

  deleteInvite(inviteId: String): Observable<any> {
    const url = `${this.api.extended}/organization/invite/${inviteId}`;

    return this.http.delete(url).pipe(catchError(({ meta }: any) => meta));
  }
}
