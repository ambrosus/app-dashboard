import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export class OrganizationsService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  checkOrganization(title) {
    return new Observable(observer => {
      const url = `/api/organizations/check/${title}`;

      this.http.get(url).subscribe(
        res => observer.next(res),
        err => observer.error(err.error),
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
        err => { observer.error(err.error); },
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
        err => { observer.error(err.error); },
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
        err => { observer.error(err.error); },
      );
    });
  }

  organizationRequest(body) {
    const url = `/api/organizations/request`;

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err.error); },
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
        err => { observer.error(err.error); },
      );
    });
  }
}
