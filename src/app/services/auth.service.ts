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

  ngOnDestroy() { }

  isLoggedIn(): Boolean {
    const account = <any>this.storageService.get('account') || {};
    const secret = this.storageService.get('secret');

    return !!(account.address && secret);
  }

  getToken(): String | null {
    const secret = this.storageService.get('secret');
    const validUntil = moment()
      .add(5, 'days')
      .unix();
    return secret ? this.sdk.getToken(secret, validUntil) : null;
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

    return new Observable(observer => {
      this.http.post(url, { email }).subscribe(
        ({ data }: any) => {
          try {
            console.log('[GET] PrivateKey token: ', data);
            let token = data.token;
            token = JSON.parse(atob(data.token));
            const [address, privateKey] = this.decryptPrivateKey(
              token,
              password,
            );
            if (!address) {
              return observer.error({ message: 'Password is incorrect' });
            }

            this.storageService.set('secret', privateKey);
            this.storageService.set('token', this.getToken());

            this.accountsService.getAccount(address).subscribe(
              ({ data: _data }: any) => {
                console.log('[GET] Account: ', _data);
                this.storageService.set('account', _data);
                this.accountsService._account.next(_data);
                this.router.navigate(['/assets']);
                return observer.next(_data);
              },
              err => {
                console.error('[GET] Account: ', err);
                return observer.error(err);
              },
            );
          } catch (e) {
            observer.error({ message: 'Password is incorrect' });
          }
        },
        ({ meta }: any) => observer.error(meta),
      );
    });
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
