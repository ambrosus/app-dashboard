import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { Observable } from 'rxjs';
import * as moment from 'moment-timezone';
import { UsersService } from './users.service';

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
    private storageService: StorageService,
    private userService: UsersService,
  ) {
    this.sdk = new AmbrosusSDK({
      Web3,
    });
    this.web3 = new Web3();
  }

  isLoggedIn() {
    const user = <any>this.storageService.get('user');
    const token = this.storageService.get('token');
    const secret = this.storageService.get('secret');

    return user && user.address && secret && token;
  }

  getToken(secret = null) {
    const _secret = secret || this.storageService.get('secret');
    const validUntil = moment().add(5, 'days').format();
    return _secret ? this.sdk.getToken(_secret, validUntil) : {};
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
            this.storageService.set('secret', secret);
            this.storageService.set('token', this.getToken(secret));
            this.storageService.set('user', res.data);
            this.userService._user.next(res.data);
            return observer.next(res.data);
          } else { return observer.next(res); }
        },
        err => observer.error(err.error),
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

            this.storageService.set('secret', privateKey);
            this.storageService.set('user', data);
            this.storageService.set('token', this.getToken(privateKey));

            this.userService._user.next(data);
            observer.next('success');
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
}
