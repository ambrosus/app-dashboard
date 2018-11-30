import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { environment } from 'environments/environment';

declare let AmbrosusSDK: any;
declare let Web3: any;

interface Account {
  _id?: string;
  accessLevel?: number;
  address?: string;
  createdBy?: string;
  createdOn?: number;
  email?: string;
  fullName?: string;
  organization?: number;
  permissions?: string[];
  registeredBy?: string;
  registeredOn?: number;
  timeZone?: string;
}

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

  to(O: Observable<any>) {
    return O.toPromise()
      .then(response => response)
      .catch(error => ({ error }));
  }

  async getAccounts(next: string = ''): Promise<any> {
    const url = `${this.api.extended}/account&next=${next}`;

    const accounts = await this.to(this.http.get(url));
    if (accounts.error) {
      throw new Error(accounts.error);
    }

    return accounts.data;
  }

  async getAccount(address: string): Promise<any> {
    const url = `${this.api.extended}/account/${address}`;

    const account = await this.to(this.http.get(url));
    if (account.error) {
      throw new Error(account.error);
    }

    return account.data;
  }

  async modifyAccount(address: string, body: Account): Promise<any> {
    let url = `${this.api.extended}/account/${address}`;
    if (body.accessLevel || body.permissions) {
      url = `${this.api.core}/accounts/${address}`;
    }

    const account = await this.to(this.http.put(url, body));
    if (account.error) {
      throw new Error(account.error);
    }

    return account.data;
  }
}
