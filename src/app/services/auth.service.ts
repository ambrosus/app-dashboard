import { AssetsService } from './assets.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { StorageService } from './storage.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  accountsAction = new Subject();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService,
    private assets: AssetsService
  ) {}

  isLoggedIn() {
    const token = this.storage.get('token');
    const address = this.storage.get('address');
    return token && address;
  }

  getAccounts() {
    return new Observable(observer => {
      const url = `/api/auth/accounts`;

      this.http.get(url).subscribe(
        resp => {
          return observer.next(resp);
        },
        err => {
          console.log('GET accounts err: ', err);
          return observer.error(err);
        }
      );
    });
  }

  getAccountByAddress(address) {
    return new Observable(observer => {
      const url = `/api/auth/accounts/${address}`;

      this.http.get(url).subscribe(
        resp => {
          console.log('GET account success: ', resp);
          return observer.next(resp);
        },
        err => {
          console.log('GET account err: ', err);
          return observer.error(err);
        }
      );
    });
  }

  getToken() {
    const params = {
      validUntil: 1600000000
    };
    const url = `${environment.host}${environment.apiUrls.token}`;
    return this.http.post(url, params);
  }

  addAccount(address, secret, token, has_account = false, email = false, full_name = false, company = false) {
    let accounts: any = this.storage.get('accounts');
    accounts = accounts ? JSON.parse(accounts) : [];

    if (!accounts.some((account) => account.address === address || account.email === email)) {
      accounts.unshift({
        address,
        secret,
        token,
        has_account,
        email,
        full_name,
        company
      });
      this.accountsAction.next(true);
      this.storage.set('accounts', JSON.stringify(accounts));
    }
  }

  loginDemoAccounts(demoAccounts) {
    this.setDetails(demoAccounts[0]['address'], demoAccounts[0]['secret'], null,
      true, demoAccounts[0]['email'], demoAccounts[0]['full_name'], demoAccounts[0]['company']);
    this.storage.set('isLoggedin', true);
    this.storage.set('demo', true);
    this.storage.set('accounts', JSON.stringify(demoAccounts));
    this.assets.initSDK();
    this.accountsAction.next(true);
    this.router.navigate(['/assets']);
  }

  switchAccount(address) {
    let accounts: any = this.storage.get('accounts');
    accounts = accounts ? JSON.parse(accounts) : [];

    accounts.map((account, index) => {
      if (account.address === address) {
        accounts.splice(index, 1);
        accounts.unshift(account);
        this.setDetails(account.address, account.secret, account.token, account.has_account || false,
          account.email || '', account.full_name || '', account.company || '');
        this.storage.set('accounts', JSON.stringify(accounts));
        this.assets.initSDK();
        this.accountsAction.next(true);
        this.router.navigate(['/assets']);
      }
    });
  }

  login(address: string, secret: string) {
    // Used by interceptor, to set headers
    this.storage.set('secret', secret);
    this.storage.set('address', address);
    return new Observable(observer => {
      this.getToken().subscribe(
        (resp: any) => {
          this.storage.set('token', resp.token);
          // Address request
          const url = `${environment.host}${environment.apiUrls.address}${address}`;
          this.http.get(url).subscribe(
            _resp => {
              this.storage.set('address', address);
              this.storage.set('isLoggedin', true);
              this.assets.initSDK();

              this.getAccountByAddress(address).subscribe(
                (r: any) => {
                  this.storage.set('email', r.account.email);
                  this.storage.set('full_name', r.account.full_name);
                  this.storage.set('has_account', true);
                  this.storage.set('notifications', JSON.stringify(r.notifications));
                  this.addAccount(address, secret, resp.token, true, r.account.email, r.account.full_name, r.account.company);
                },
                err => {
                  this.storage.set('has_account', false);
                  this.addAccount(address, secret, resp.token);
                }
              );

              observer.next('success');
            },
            err => {
              observer.error(err);
            }
          );
        },
        err => {
          this.storage.delete('secret');
          observer.error(err);
        }
      );
    });
  }

  setDetails (address, secret, token = null, has_account = false, email = null, full_name = null, company = null) {
    this.storage.set('address', address);
    this.storage.set('secret', secret);
    this.storage.set('token', token);
    this.storage.set('has_account', has_account);
    this.storage.set('email', email);
    this.storage.set('full_name', full_name);
    this.storage.set('company', company);
  }

  logout() {
    let accounts: any = this.storage.get('accounts');
    accounts = accounts ? JSON.parse(accounts) : [];
    accounts.shift();
    this.storage.set('accounts', JSON.stringify(accounts));

    if (accounts.length === 0) {
      this.logoutAll();
    } else {
      this.setDetails(accounts[0].address, accounts[0].secret, accounts[0].token, accounts[0].has_account ||
        false, accounts[0].email || '', accounts[0].full_name || '', accounts[0].company || '');
      this.accountsAction.next(true);
      this.router.navigate(['/assets']);
    }
  }

  logoutAll() {
    this.storage.clear();
    this.router.navigate(['/login']);
    this.accountsAction.next(true);
  }
}
