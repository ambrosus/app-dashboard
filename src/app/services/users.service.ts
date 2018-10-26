import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import * as moment from 'moment-timezone';

declare let AmbrosusSDK: any;
declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  _user = new BehaviorSubject({});
  sdk;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    const user = <any>this.storageService.get('user') || {};
    this._user.next(user);
    this.sdk = new AmbrosusSDK({ Web3 });
  }

  getToken(secret = null) {
    const _secret = secret || this.storageService.get('secret');
    const validUntil = moment().add(5, 'days').format();
    return _secret ? this.sdk.getToken(_secret, validUntil) : {};
  }

  /* User */

  editUser(body, email) {
    const token = this.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };

    return new Observable(observer => {
      this.http.put(`/api/users/${email}`, body, { headers }).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error),
      );
    });
  }

  createUser(body) {
    const url = `/api/users`;

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => observer.next(data),
        err => { console.error('Account CREATE error: ', err.error); observer.error(err.error); },
      );
    });
  }

  getUser(email) {
    return new Observable(observer => {
      const url = `/api/users/${email}`;

      this.http.get(url).subscribe(
        ({ data }: any) => {
          this._user.next(data);
          return observer.next(data);
        },
        err => observer.error(err.error),
      );
    });
  }

  getUsers() {
    const token = this.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };
    const url = `/api/users`;

    return new Observable(observer => {
      this.http.get(url, { headers }).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error),
      );
    });
  }
}
