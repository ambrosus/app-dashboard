import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';

declare let AmbrosusSDK: any;
declare let Web3: any;

interface Account {
  _id?: String;
  accessLevel?: Number;
  address?: String;
  createdBy?: String;
  createdOn?: Number;
  email?: String;
  fullName?: String;
  organization?: Number;
  permissions?: String[];
  registeredBy?: String;
  registeredOn?: Number;
  timeZone?: String;
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

  getAccounts(next: String = ''): Observable<any> {
    const url = `${this.api.extended}/account&next=${next}`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  getAccount(address: String): Observable<any> {
    const url = `${this.api.extended}/account/${address}`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  modifyAccount(address: String, body: Account): Observable<any> {
    let url = `${this.api.extended}/account/${address}`;
    if (body.accessLevel || body.permissions) {
      url = `${this.api.core}/accounts/${address}`;
    }

    return this.http.put(url, body).pipe(catchError(({ meta }: any) => meta));
  }
}
