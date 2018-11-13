import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable()
export class OrganizationsService {
  api;

  constructor(private http: HttpClient) {
    this.api = environment.api;
  }

  getOrganizations(next = '') {
    const url = `${this.api.extended}/organization?next=${next}`;

    return new Promise((resolve, reject) => {
      this.http
        .get(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  getOrganization(organizationId) {
    const url = `${this.api.extended}/organization/${organizationId}`;

    return new Promise((resolve, reject) => {
      this.http
        .get(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  modifyOrganization(organizationId, body) {
    const url = `${this.api.extended}/organization/${organizationId}`;

    return new Promise((resolve, reject) => {
      this.http
        .put(url, body)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  getOrganizationAccounts(organizationId) {
    const url = `${this.api.extended}/organization/${organizationId}/accounts`;

    return new Promise((resolve, reject) => {
      this.http
        .get(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  // Organization requests

  createOrganizationRequest(body) {
    const url = '${this.api.extended}/organization/request';

    return new Promise((resolve, reject) => {
      this.http
        .post(url, body)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  // Organization invites

  getInvites(next = '') {
    const url = `${this.api.extended}/organization/invite?next=${next}`;

    return new Promise((resolve, reject) => {
      this.http
        .get(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  createInvites(body: { email: any[] }) {
    const url = `${this.api.extended}/organization/invite`;

    return new Promise((resolve, reject) => {
      this.http
        .post(url, body)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  resendInvites(body: { email: any[] }) {
    const url = `${this.api.extended}/organization/invite/resend`;

    return new Promise((resolve, reject) => {
      this.http
        .post(url, body)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  verifyInvite(inviteId: String) {
    const url = `${this.api.extended}/organization/invite/${inviteId}/exists`;

    return new Promise((resolve, reject) => {
      this.http
        .get(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  acceptInvite(inviteId: String, body: { address: String }) {
    const url = `${this.api.extended}/organization/invite/${inviteId}/accept`;

    return new Promise((resolve, reject) => {
      this.http
        .post(url, body)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  deleteInvite(inviteId: String) {
    const url = `${this.api.extended}/organization/invite/${inviteId}`;

    return new Promise((resolve, reject) => {
      this.http
        .delete(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }
}
