import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class InviteService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  verifyInvite(token) {
    const url = `/api/invites/verify/${token}`;

    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); },
      );
    });
  }

  getInvites() {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/invites`;

    return new Observable(observer => {
      this.http.get(url, { headers }).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); },
      );
    });
  }

  revokeInvites(ids) {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/invites/delete`;

    return new Observable(observer => {
      this.http.post(url, { ids }, { headers }).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); },
      );
    });

  }

  sendInvite(body) {
    const token = this.authService.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/invites`;
    return new Observable(observer => {
      this.http.post(url, body, { headers }).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); },
      );
    });
  }

}
