import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Observable, Subscription } from 'rxjs';
import * as moment from 'moment-timezone';
import { UsersService } from './users.service';

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
    private usersService: UsersService,
  ) {
    this.sdk = new AmbrosusSDK({ Web3 });
    this.web3 = new Web3();
  }

  ngOnDestroy() {
    if (this.getAccountSub) { this.getAccountSub.unsubscribe(); }
  }

  isLoggedIn() {
    const user = <any>this.storageService.get('user');
    const secret = this.storageService.get('secret');

    return user && user.address && secret;
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
      } catch (e) { return observer.error({ message: 'Invalid private key' }); }

      this.http.get(`/api/account/verify/${address}`).subscribe(
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
            const token = JSON.parse(data.token);
            const [address, privateKey] = this.decryptPrivateKey(token, password);
            if (!address) { return observer.error({ message: 'Password is incorrect' }); }

            this.storageService.set('secret', privateKey);

            this.getAccountSub = this.usersService.getAccount(address).subscribe(
              account => {
                console.log('[GET] Account: ', account);
                this.storageService.set('user', account);
                this.usersService._user.next(account);
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
