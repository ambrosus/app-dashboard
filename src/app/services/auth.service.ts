import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from './accounts.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

declare let AmbrosusSDK: any;
declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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

  to(O: Observable<any>) {
    return O.toPromise()
      .then(response => response)
      .catch(error => ({ error }));
  }

  isLoggedIn(): boolean {
    const account = <any>this.storageService.get('account') || {};
    const secret = this.storageService.get('secret');

    return !!(account.address && secret);
  }

  getToken(): string | null {
    const secret = this.storageService.get('secret');
    const validUntil = moment()
      .add(5, 'days')
      .unix();
    return secret ? this.sdk.getToken(secret, validUntil) : null;
  }

  async verifyAccount(privateKey: string): Promise<any> {
    let address;
    try {
      address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
    } catch (e) {
      throw new Error('Private key is invalid');
    }
    const url = `${this.api.extended}/account/${address}/exists`;

    const account = await this.to(this.http.get(url));
    if (account.error) {
      throw new Error(account.error);
    }

    return account.data;
  }

  async login(email: string, password: string): Promise<any> {
    const url = `${this.api.extended}/account/secret`;

    const secretToken = await this.to(this.http.post(url, { email }));
    if (secretToken.error) {
      throw new Error(secretToken.error);
    }

    try {
      console.log('[GET] PrivateKey token: ', secretToken.data);

      let token = secretToken.data.token;
      token = JSON.parse(atob(token));
      const [address, privateKey] = this.decryptPrivateKey(
        token,
        password,
      );
      if (!address) {
        throw new Error('Password is incorrect');
      }

      this.storageService.set('secret', privateKey);
      this.storageService.set('token', this.getToken());

      const account = await this.accountsService.getAccount(address);

      console.log('[GET] Account: ', account);
      this.storageService.set('account', account);
      this.accountsService._account.next(account);
      this.router.navigate(['/assets']);

      return account;
    } catch (error) {
      throw error;
    }
  }

  logout(): void {
    this.storageService.clear();
    this.router.navigate(['/login']);
  }

  // UTILS

  decryptPrivateKey(token: Object, password: string) {
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

  privateKeyToAccount(privateKey: string): string | null {
    try {
      const address = this.web3.eth.accounts.privateKeyToAccount(privateKey)
        .address;
      return address;
    } catch (e) {
      return null;
    }
  }
}
