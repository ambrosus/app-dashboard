import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export class OrganizationsService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getOrganizations(next = null) {
    const token = this.authService.getToken();
    let url = `/api/organization?token=${token}`;
    if (next) {
      url += `next=${next}`;
    }

    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ meta }) => {
          observer.error(meta);
        },
      );
    });
  }

  getOrganization(organizationId) {
    const token = this.authService.getToken();
    const url = `/api/organization/${organizationId}?token=${token}`;

    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ meta }) => {
          observer.error(meta);
        },
      );
    });
  }

  modifyOrganization(organizationId, body) {
    const token = this.authService.getToken();
    const url = `/api/organization/${organizationId}?token=${token}`;

    return new Observable(observer => {
      this.http.put(url, body).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ meta }) => {
          observer.error(meta);
        },
      );
    });
  }

  getOrganizationAccounts(organizationId) {
    const token = this.authService.getToken();
    const url = `/api/organization/${organizationId}/accounts?token=${token}`;

    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ meta }) => {
          observer.error(meta);
        },
      );
    });
  }

  // Organization requests

  createOrganizationRequest(body) {
    const url = '/api/organization/request';

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ meta }) => {
          observer.error(meta);
        },
      );
    });
  }

  // Organization invites

  getInvites(next = null) {
    const token = this.authService.getToken();
    let url = `/api/organization/invite?token=${token}`;
    if (next) {
      url += `next=${next}`;
    }

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
    const token = this.authService.getToken();
    const url = `/api/organization/invite?token=${token}`;

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
    const token = this.authService.getToken();
    const url = `/api/organization/invite/resend?token=${token}`;

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
    const url = `/api/organization/invite/${inviteId}/exists`;

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
    const token = this.authService.getToken();
    const url = `/api/organization/invite/${inviteId}/accept?token=${token}`;

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
    const token = this.authService.getToken();
    const url = `/api/organization/invite/${inviteId}?token=${token}`;

    return new Promise((resolve, reject) => {
      this.http
        .delete(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  // Deprecated

  checkOrganization(title) {
    return new Observable(observer => {
      const url = `/api/organizations/check/${title}`;

      this.http
        .get(url)
        .subscribe(
          res => observer.next(res),
          ({ error }) => observer.error(error),
        );
    });
  }

  editOrganization(body, organizationID) {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/organizations/${organizationID}`;

    return new Observable(observer => {
      this.http.put(url, body, { headers }).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ error }) => {
          observer.error(error);
        },
      );
    });
  }

  getAll() {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/organizations`;

    return new Observable(observer => {
      this.http.get(url, { headers }).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ error }) => {
          observer.error(error);
        },
      );
    });
  }

  getOrganizationRequests() {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/organizations/request`;

    return new Observable(observer => {
      this.http.get(url, { headers }).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ error }) => {
          observer.error(error);
        },
      );
    });
  }

  organizationRequestApproval(body) {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/organizations/request`;

    return new Observable(observer => {
      this.http.put(url, body, { headers }).subscribe(
        ({ data }: any) => {
          observer.next(data);
        },
        ({ error }) => {
          observer.error(error);
        },
      );
    });
  }
}
