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
export class AccountsService {
  _account = new BehaviorSubject({});
  sdk;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    const account = <any>this.storageService.get('account') || {};
    this._account.next(account);
    this.sdk = new AmbrosusSDK({ Web3 });
  }

  getToken(secret = null) {
    secret = secret || this.storageService.get('secret');
    const validUntil = moment().add(5, 'days').unix();
    return secret ? this.sdk.getToken(secret, validUntil) : {};
  }

  getAccounts(next = null) {
    const token = this.getToken();
    const url = `/api/account?token=${token}&next=${next}`;

    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        ({ meta }) => observer.error(meta),
      );
    });
  }

  getAccount(address) {
    const token = this.getToken();
    const url = `/api/account/${address}?token=${token}`;

    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        ({ meta }) => observer.error(meta),
      );
    });
  }

  modifyAccount(address, body) {
    const token = this.getToken();
    const url = `/api/account/${address}?token=${token}`;

    return new Observable(observer => {
      this.http.put(url, body).subscribe(
        ({ data }: any) => observer.next(data),
        ({ meta }) => observer.error(meta),
      );
    });
  }


  // Deprecated

  editUser(body, email) {
    const token = this.getToken();
    const headers = { Authorization: `AMB_TOKEN ${token}` };

    return new Observable(observer => {
      this.http.put(`/api/users/${email}`, body, { headers }).subscribe(
        ({ data }: any) => observer.next(data),
        ({ error }) => observer.error(error),
      );
    });
  }

  createUser(body) {
    const url = `/api/users`;

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => observer.next(data),
        ({ error }) => { console.error('Account CREATE error: ', error); observer.error(error); },
      );
    });
  }

  getUser(email) {
    return new Observable(observer => {
      const token = this.getToken();
      const headers = { Authorization: `AMB_TOKEN ${token}` };
      const url = `/api/users/${email}`;

      this.http.get(url, { headers }).subscribe(
        ({ data }: any) => {
          this._account.next(data);
          observer.next(data);
        },
        ({ error }) => observer.error(error),
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
        ({ error }) => observer.error(error),
      );
    });
  }
}
