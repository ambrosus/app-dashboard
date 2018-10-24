import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InviteService {

  constructor(private http: HttpClient, private storageService: StorageService) { }

  verifyInvite(token) {
    const url = `/api/invites/verify/${token}`;

    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); }
      );
    });
  }

  getInvites(user) {
    const address = this.storageService.get('user')['address'];
    const url = `/api/invites/organization/${user.organization._id}?address=${address}`;

    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); }
      );
    });
  }

  revokeInvites(ids) {
    const user = <any>this.storageService.get('user');
    const url = `/api/invites/delete?user=${user._id}`;

    return new Observable(observer => {
      this.http.post(url, { ids }).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); }
      );
    });

  }

  sendInvite(body) {
    const address = this.storageService.get('user')['address'];
    const url = `/api/invites?address=${address}`;
    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); }
      );
    });
  }

}
