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
  getUserSub: Subscription;
  sdk;
  web3;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private userService: UsersService,
  ) {
    this.sdk = new AmbrosusSDK({
      Web3,
    });
    this.web3 = new Web3();
  }

  ngOnDestroy() {
    if (this.getUserSub) { this.getUserSub.unsubscribe(); }
  }

  isLoggedIn() {
    const user = <any>this.storageService.get('user');
    const token = this.storageService.get('token');
    const secret = this.storageService.get('secret');

    return user && user.address && secret && token;
  }

  getToken(secret = null) {
    secret = secret || this.storageService.get('secret');
    const validUntil = moment().add(5, 'days').unix();
    return secret ? this.sdk.getToken(secret, validUntil) : {};
  }

  verifyAccount(secret) {
    return new Observable(observer => {
      let address;
      try {
        address = this.web3.eth.accounts.privateKeyToAccount(secret).address;
      } catch (e) { return observer.error({ message: 'Invalid secret' }); }

      this.http.post('/api/auth/verify', { address }).subscribe(
        resp => observer.next(resp),
        err => observer.error(err.error),
      );
    });
  }

  login(email: string, password: string) {
    return new Observable(observer => {
      this.http.post('/api/auth/login', { email, password }).subscribe(
        ({ data }: any) => {
          const token = JSON.parse(data);
          try {
            const { privateKey } = this.web3.eth.accounts.decrypt(token, password);

            this.storageService.set('secret', privateKey);
            this.storageService.set('token', this.getToken(privateKey));

            return observer.next();
          } catch (e) { return observer.error({ message: 'Password is incorrect.' }); }
        },
        err => observer.error(err.error),
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
}
