import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from './accounts.service';
import { environment } from 'environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

declare let AmbrosusSDK: any;
declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  sdk;
  web3;
  api;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private accountsService: AccountsService,
  ) {
    this.sdk = new AmbrosusSDK({ Web3 });
    this.web3 = new Web3();
    this.api = environment.api;
  }

  to(O: Observable<any>) {
    return O.toPromise()
      .then(response => [null, response])
      .catch(error => [error]);
  }

  ngOnDestroy() {}

  isLoggedIn(): Boolean {
    const account = <any>this.storageService.get('account');
    const secret = this.storageService.get('secret');

    return account && account.address && secret ? true : false;
  }

  getToken(): String {
    const secret = this.storageService.get('secret');
    const validUntil = moment()
      .add(5, 'days')
      .unix();
    return secret ? this.sdk.getToken(secret, validUntil) : '';
  }

  verifyAccount(privateKey: String): Observable<any> {
    let address;
    try {
      address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
    } catch (e) {
      return throwError({ message: 'Private key is invalid' });
    }
    const url = `${this.api.extended}/account/${address}/exists`;

    return this.http.get(url).pipe(catchError(({ meta }: any) => meta));
  }

  login(email: String, password: String): Observable<any> {
    const url = `${this.api.extended}/account/secret`;

    return this.http.post(url, { email }).pipe(
      map(async ({ data }: any) => {
        try {
          console.log('[GET] PrivateKey token: ', data);
          let token = data.token;
          token = JSON.parse(atob(data.token));
          const [address, privateKey] = this.decryptPrivateKey(token, password);
          if (!address) {
            return throwError({ meta: { message: 'Password is incorrect' } });
          }

          this.storageService.set('secret', privateKey);
          this.storageService.set('token', this.getToken());

          const [error, account] = await this.to(
            this.accountsService.getAccount(address),
          );
          if (error) {
            console.error('[GET] Account: ', error);
            return throwError(error);
          }

          console.log('[GET] Account: ', account.data);
          this.storageService.set('account', account.data);
          this.accountsService._account.next(account.data);
          this.router.navigate(['/assets']);
          return account.data;
        } catch (e) {
          throwError({ meta: { message: 'Password is incorrect' } });
        }
      }),
      catchError(({ meta }: any) => meta),
    );
  }

  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  // UTILS

  decryptPrivateKey(token: Object, password: String) {
    try {
      const { address, privateKey } = this.web3.eth.accounts.decrypt(
        token,
        password,
      );
      return [address, privateKey];
    } catch (e) {
      return [null];
    }
  }

  privateKeyToAccount(privateKey: String): String | null {
    try {
      const address = this.web3.eth.accounts.privateKeyToAccount(privateKey)
        .address;
      return address;
    } catch (e) {
      return null;
    }
  }
}
