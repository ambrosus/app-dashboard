import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { environment } from 'environments/environment';

declare let AmbrosusSDK: any;
declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  _account = new BehaviorSubject({});
  sdk;
  api;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    const account = <any>this.storageService.get('account') || {};
    this._account.next(account);
    this.sdk = new AmbrosusSDK({ Web3 });
    this.api = environment.api;
  }

  getAccounts(next = '') {
    const url = `${this.api.extended}/account&next=${next}`;

    return new Promise((resolve, reject) => {
      this.http
        .get(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  getAccount(address) {
    const url = `${this.api.extended}/account/${address}`;

    return new Promise((resolve, reject) => {
      this.http
        .get(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  modifyAccount(address, body) {
    let url = `${this.api.extended}/account/${address}`;
    if (body.accessLevel || body.permissions) {
      url = `${this.api.core}/accounts/${address}`;
    }

    return new Promise((resolve, reject) => {
      this.http
        .put(url, body)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }
}
