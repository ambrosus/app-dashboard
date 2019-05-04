/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { environment } from 'environments/environment';
import * as AmbrosusSDK from 'ambrosus-javascript-sdk';
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
      throw accounts.error;
    }

    return accounts.data;
  }

  async getAccount(address: string): Promise<any> {
    const url = `${this.api.extended}/account/${address}`;

    const account = await this.to(this.http.get(url));
    if (account.error) {
      console.log(account.error);
      throw account.error;
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
      throw account.error;
    }

    return account.data;
  }
}
