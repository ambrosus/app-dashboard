import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';

declare let AmbrosusSDK: any;
declare let Web3: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  sdk;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    const hermes: any = this.storage.get('hermes') || {};
    this.sdk = new AmbrosusSDK({
      apiEndpoint: hermes.url,
      Web3
    });
  }

  emit(type) {
    window.dispatchEvent(new Event(type));
  }

  isLoggedIn() {
    const user: any = this.storage.get('user');
    const token = this.storage.get('token');
    const secret = this.storage.get('secret');

    return user && user.address && secret && token;
  }

  getToken(secret) {
    return this.sdk.getToken(secret);
  }

  getAccount(email) {
    return new Observable(observer => {
      const url = `/api/users/${email}`;

      this.http.get(url).subscribe(
        resp => observer.next(resp),
        err => observer.error(err)
      );
    });
  }

  verifyAccount(address, token, hermes) {
    return new Observable(observer => {
      const url = `/api/auth/verify`;
      const body = {
        address,
        token,
        hermes
      };

      this.http.post(url, body).subscribe(
        resp => observer.next(resp),
        err => observer.error(err)
      );
    });
  }

  addAccount(user) {
    const accounts: any = this.storage.get('accounts') || [];

    if (!accounts.some((account) => account.address === user.address)) {
      user.secret = this.storage.get('secret');
      accounts.unshift(user);
      this.storage.set('accounts', accounts);
    }
  }

  switchAccount(address) {
    const accounts: any = this.storage.get('accounts') || [];

    accounts.map((account, index) => {
      if (account.address === address) {
        this.logoutAPI();
        accounts.splice(index, 1);
        accounts.unshift(account);
        this.storage.set('accounts', accounts);
        this.login(address, account.secret).subscribe(
          resp => {
            console.log('Login success: ', resp);
            this.router.navigate(['/assets']);
          },
          err => console.log('Login error: ', err)
        );
      }
    });
  }

  login(address: string, secret: string) {
    const user = { address };
    this.storage.set('user', user);
    this.storage.set('secret', secret);

    return new Observable(observer => {
      const token = this.getToken(secret);
      const hermes: any = this.storage.get('hermes') || {};

      this.verifyAccount(address, token, hermes).subscribe(
        (r: any) => {
          this.storage.set('isLoggedin', true);
          this.storage.set('token', token);
          if (!r.message) {
            this.storage.set('user', r);
            this.storage.set('has_account', true);
            this.addAccount(r);
            this.emit('user:login');
            observer.next('success');
          } else {
            this.storage.set('has_account', false);
            this.addAccount({ address });
            this.emit('user:login');
            observer.next('success');
          }
        },
        err => observer.error(err)
      );
    });
  }

  // Deletes current session
  logoutAPI() {
    const url = `/api/auth/logout`;

    this.http.delete(url).subscribe(
      () => console.log('User API logout success'),
      () => console.log('User API logout error')
    );
  }

  logout() {
    const accounts: any = this.storage.get('accounts') || [];
    accounts.shift();
    this.storage.set('accounts', accounts);

    if (accounts.length === 0) {
      this.logoutAll();
    } else {
      this.logoutAPI();
      this.storage.set('user', accounts[0]);
      this.emit('user:login');
      this.router.navigate(['/assets']);
    }
  }

  logoutAll() {
    this.logoutAPI();
    this.storage.clear();
    this.emit('user:login');
    this.router.navigate(['/login']);
  }
}
