import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
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
    private storage: StorageService,
    private deviceService: DeviceDetectorService
  ) {
    const hermes = <any>this.storage.get('hermes') || <any>{};
    this.sdk = new AmbrosusSDK({
      apiEndpoint: hermes.url,
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

  getToken(secret = this.storage.get('secret')) {
    const validUntil = moment().add(5, 'days').format();
    return this.sdk.getToken(secret, validUntil);
  }

  getAccount(email) {
    return new Observable(observer => {
      const url = `/api/users/${email}`;

      this.http.get(url).subscribe(
        resp => observer.next(resp),
        err => observer.error(err.error)
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


  verifyAccount(address, secret) {
    let token = '';
    try {
      token = this.getToken(secret);
    } catch (e) { }

    return new Observable(observer => {
      const deviceInfo = this.deviceService.getDeviceInfo();

      this.http.post('/api/auth/verify', { address, token, deviceInfo }).subscribe(
        user => {
          this.storage.set('secret', secret);
          this.storage.set('user', user);
          this.storage.set('token', token);
          this.addAccount(user);
          this.emit('user:refresh');
          return observer.next(user);
        },
        err => observer.error(err.error)
      );
    });
  }

  login(email: string, password: string) {
    return new Observable(observer => {
      const deviceInfo = this.deviceService.getDeviceInfo();

      this.http.post('/api/auth/login', { email, password, deviceInfo }).subscribe(
        (user: any) => {
          const token = JSON.parse(user.token);
          const { address, privateKey } = this.web3.eth.accounts.decrypt(token, password);

          user.address = address;

          this.storage.set('secret', privateKey);
          this.storage.set('user', user);
          this.storage.set('token', this.getToken(privateKey));

          this.addAccount(user);
          this.emit('user:refresh');
          observer.next('success');
        },
        err => observer.error(err.error)
      );
    });
  }

  // Deletes current session
  logoutAPI() {

    this.http.delete('/api/auth/logout').subscribe(
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
      this.emit('user:refresh');
      this.router.navigate(['/assets']);
    }
  }

  logoutAll() {
    this.logoutAPI();
    this.storage.clear();
    this.emit('user:refresh');
    this.router.navigate(['/login']);
  }

  getHermeses() {
    return new Observable(observer => {
    this.http.get('/api/hermeses').subscribe(
      (user: any) => { observer.next(user); },
      err => { observer.error(err); }
    );
    });
  }

}
