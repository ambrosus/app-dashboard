import { AssetsService } from './assets.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
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
          console.log('GET accounts success: ', resp);
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
                  this.storage.set('email', r.data.email);
                  this.storage.set('full_name', r.data.full_name);
                  this.storage.set('has_account', true);
                },
                err => {
                  this.storage.set('has_account', false);
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

  logout() {
    this.storage.clear();
    this.router.navigate(['/login']);
  }
}
