import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Observable, Subscription } from 'rxjs';
import * as moment from 'moment-timezone';
import { AccountsService } from './accounts.service';

declare let AmbrosusSDK: any;
declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  getAccountSub: Subscription;
  sdk;
  web3;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private accountsService: AccountsService,
  ) {
    this.sdk = new AmbrosusSDK({ Web3 });
    this.web3 = new Web3();
  }

  ngOnDestroy() {
    if (this.getAccountSub) { this.getAccountSub.unsubscribe(); }
  }

  isLoggedIn() {
    const account = <any>this.storageService.get('account');
    const secret = this.storageService.get('secret');

    return account && account.address && secret;
  }

  getToken(secret = null) {
    secret = secret || this.storageService.get('secret');
    const validUntil = moment().add(5, 'days').unix();
    return secret ? this.sdk.getToken(secret, validUntil) : {};
  }

  verifyAccount(privateKey) {
    return new Observable(observer => {
      let address;
      try {
        address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
      } catch (e) { return observer.error({ message: 'Private key is invalid' }); }

      this.http.get(`/api/account/${address}/exists`).subscribe(
        ({ data }: any) => observer.next(data),
        ({ meta }) => observer.error(meta),
      );
    });
  }

  login(email: string, password: string) {
    return new Observable(observer => {
      this.http.post('/api/account/secret', { email }).subscribe(
        ({ data }: any) => {
          try {
            console.log('[GET] PrivateKey token: ', data);
            let token = data.token;
            token = JSON.parse(atob(data.token));
            const [address, privateKey] = this.decryptPrivateKey(token, password);
            if (!address) { return observer.error({ message: 'Password is incorrect' }); }

            this.storageService.set('secret', privateKey);

            this.getAccountSub = this.accountsService.getAccount(address).subscribe(
              account => {
                console.log('[GET] Account: ', account);
                this.storageService.set('account', account);
                this.accountsService._account.next(account);
                this.router.navigate(['/assets']);
                return observer.next(account);
              },
              error => {
                console.error('[GET] Account: ', error);
                return observer.error(error);
              },
            );
          } catch (e) { return observer.error({ message: 'Password is incorrect' }); }
        },
        ({ meta }) => observer.error(meta),
      );
    });
  }

  logout() {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  // UTILS

  decryptPrivateKey(token, password) {
    try {
      const { address, privateKey } = this.web3.eth.accounts.decrypt(token, password);
      return [address, privateKey];
    } catch (e) { return [null]; }
  }

  privateKeyToAccount(privateKey) {
    try {
      const address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
      return address;
    } catch (e) { return null; }
  }
}
