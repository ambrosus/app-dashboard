import { AssetsService } from './assets.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService,
    private assets: AssetsService
  ) {}

  emit(type) {
    window.dispatchEvent(new Event(type));
  }

  isLoggedIn() {
    const user: any = this.storage.get('user');
    const token = this.storage.get('token');
    const secret = this.storage.get('secret');

    return user && user.address && secret && token;
  }

  getToken() {
    const params = {
      validUntil: 1600000000
    };

    const hermes: any = this.storage.get('hermes') || {};
    const url = `${hermes.url}/token`;

    return this.http.post(url, params);
  }

  getAccountByAddress(address) {
    return new Observable(observer => {
      const url = `/api/users/${address}`;

      this.http.get(url).subscribe(
        resp => {
          return observer.next(resp);
        },
        err => {
          return observer.error(err);
        }
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
        accounts.splice(index, 1);
        accounts.unshift(account);
        this.storage.set('user', account);
        this.storage.set('secret', account.secret);
        this.storage.set('accounts', accounts);
        this.emit('user:login');
        this.router.navigate(['/assets']);
      }
    });
  }

  login(address: string, secret: string) {
    const user = { address };
    this.storage.set('user', user);
    this.storage.set('secret', secret);

    return new Observable(observer => {

      // Hermes token request
      this.getToken().subscribe(
        (resp: any) => {
          this.storage.set('token', resp.token);
          const hermes: any = this.storage.get('hermes') || {};

          // Hermes address request
          const url = `${hermes.url}/accounts/${address}`;
          this.http.get(url).subscribe(
            _resp => {
              this.storage.set('isLoggedin', true);

              this.getAccountByAddress(address).subscribe(
                (r: any) => {
                  this.storage.set('user', r);
                  this.storage.set('has_account', true);
                  this.addAccount(r);
                  this.emit('user:login');
                  observer.next('success');
                },
                err => {
                  this.storage.set('has_account', false);
                  this.addAccount({ address });
                  this.emit('user:login');
                  observer.next('success');
                }
              );
            },
            err => {
              observer.error(err);
            }
          );
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

  logout() {
    const accounts: any = this.storage.get('accounts') || [];
    accounts.shift();
    this.storage.set('accounts', accounts);

    if (accounts.length === 0) {
      this.logoutAll();
    } else {
      this.storage.set('user', accounts[0]);
      this.emit('user:login');
      this.router.navigate(['/assets']);
    }
  }

  logoutAll() {
    this.storage.clear();
    this.emit('user:login');
    this.router.navigate(['/login']);
  }
}
