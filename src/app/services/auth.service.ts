import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';
import * as moment from 'moment-timezone';

declare let AmbrosusSDK: any;
declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  sdk;
  web3;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {
    this.sdk = new AmbrosusSDK({
      Web3,
    });
    this.web3 = new Web3();
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

  getToken(secret = null) {
    const _secret = secret || this.storage.get('secret');
    const validUntil = moment().add(5, 'days').format();
    return this.sdk.getToken(_secret, validUntil);
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

  verifyAccount(secret) {
    return new Observable(observer => {
      let address;
      try {
        address = this.web3.eth.accounts.privateKeyToAccount(secret).address;
      } catch (e) { return observer.error({ message: 'Invalid secret' }); }

      this.http.post('/api/auth/verify', { address }).subscribe(
        (res: any) => {
          if (res.data) {
            this.storage.set('secret', secret);
            this.storage.set('token', this.getToken(secret));
            this.storage.set('user', res.data);
            this.addAccount(res.data);
            this.emit('user:refresh');
            return observer.next(res.data);
          } else { return observer.next(res); }
        },
        err => observer.error(err.error)
      );
    });
  }

  login(email: string, password: string) {
    return new Observable(observer => {

      this.http.post('/api/auth/login', { email, password }).subscribe(
        ({ data }: any) => {
          console.log(data);
          const token = JSON.parse(data.token);
          try {
            const { address, privateKey } = this.web3.eth.accounts.decrypt(token, password);

            data.address = address;

            this.storage.set('secret', privateKey);
            this.storage.set('user', data);
            this.storage.set('token', this.getToken(privateKey));

            this.addAccount(data);
            this.emit('user:refresh');
            observer.next('success');

          } catch (e) { return observer.error({ message: 'Password is incorrect.' }); }
        },
        err => observer.error(err.error)
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
      this.emit('user:refresh');
      this.router.navigate(['/assets']);
    }
  }

  logoutAll() {
    this.storage.clear();
    this.emit('user:refresh');
    this.router.navigate(['/login']);
  }
}
