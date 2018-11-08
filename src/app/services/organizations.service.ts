import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export class OrganizationsService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  createOrganizationRequest(body) {
    const url = '/api/organization/request';

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => { observer.next(data); },
        ({ meta }) => { observer.error(meta); },
      );
    });
  }

  // Deprecated

  checkOrganization(title) {
    return new Observable(observer => {
      const url = `/api/organizations/check/${title}`;

      this.http.get(url).subscribe(
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
        ({ data }: any) => { observer.next(data); },
        ({ error }) => { observer.error(error); },
      );
    });
  }

  getAll() {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/organizations`;

    return new Observable(observer => {
      this.http.get(url, { headers }).subscribe(
        ({ data }: any) => { observer.next(data); },
        ({ error }) => { observer.error(error); },
      );
    });
  }

  getOrganizationRequests() {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/organizations/request`;

    return new Observable(observer => {
      this.http.get(url, { headers }).subscribe(
        ({ data }: any) => { observer.next(data); },
        ({ error }) => { observer.error(error); },
      );
    });
  }

  organizationRequestApproval(body) {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/organizations/request`;

    return new Observable(observer => {
      this.http.put(url, body, { headers }).subscribe(
        ({ data }: any) => { observer.next(data); },
        ({ error }) => { observer.error(error); },
      );
    });
  }
}
