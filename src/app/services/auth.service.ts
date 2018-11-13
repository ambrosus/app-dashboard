import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from './accounts.service';
import { environment } from 'environments/environment';

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

  ngOnDestroy() {}

  isLoggedIn() {
    const account = <any>this.storageService.get('account');
    const secret = this.storageService.get('secret');

    return account && account.address && secret;
  }

  getToken(secret = null) {
    secret = secret || this.storageService.get('secret');
    const validUntil = moment()
      .add(5, 'days')
      .unix();
    return secret ? this.sdk.getToken(secret, validUntil) : {};
  }

  verifyAccount(privateKey) {
    return new Promise((resolve, reject) => {
      let address;
      try {
        address = this.web3.eth.accounts.privateKeyToAccount(privateKey)
          .address;
      } catch (e) {
        return reject({ message: 'Private key is invalid' });
      }
      const url = `${this.api.extended}/account/${address}/exists`;

      this.http
        .get(url)
        .subscribe(
          ({ data }: any) => resolve(data),
          ({ meta }) => reject(meta),
        );
    });
  }

  login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      const url = `${this.api.extended}/account/secret`;

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
              return reject({ message: 'Password is incorrect' });
            }

            this.storageService.set('secret', privateKey);
            this.storageService.set('token', this.getToken());

            this.accountsService
              .getAccount(address)
              .then(account => {
                console.log('[GET] Account: ', account);
                this.storageService.set('account', account);
                this.accountsService._account.next(account);
                this.router.navigate(['/assets']);
                resolve(account);
              })
              .catch(error => {
                console.error('[GET] Account: ', error);
                reject(error);
              });
          } catch (e) {
            reject({ message: 'Password is incorrect' });
          }
        },
        ({ meta }) => reject(meta),
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
      const { address, privateKey } = this.web3.eth.accounts.decrypt(
        token,
        password,
      );
      return [address, privateKey];
    } catch (e) {
      return [null];
    }
  }

  privateKeyToAccount(privateKey) {
    try {
      const address = this.web3.eth.accounts.privateKeyToAccount(privateKey)
        .address;
      return address;
    } catch (e) {
      return null;
    }
  }
}
