import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { StorageService } from './storage.service';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedin: Subject<boolean> = new Subject<boolean>();
  cleanForm: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {}

  isLoggedIn() {
    const token = this.storage.get('token');
    const address = this.storage.get('address');
    return token && address;
  }

  accounts() {
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

  getToken(secret: string) {
    const params = {
      validUntil: 1600000000
    };
    const url = `${environment.host}${environment.apiUrls.token}`;
    return this.http.post(url, params);
  }

  login(address: string, secret: string) {
    this.storage.set('secret', secret);
    this.storage.set('address', address);
    return new Observable(observer => {
      this.getToken(secret).subscribe(
        (resp: any) => {
          this.storage.set('token', resp.token);
          // Address request
          const url = `${environment.host}${
            environment.apiUrls.address
          }${address}`;
          this.http.get(url).subscribe(
            _resp => {
              this.loggedin.next(true);
              this.storage.set('address', address);
              this.storage.set('isLoggedin', true);
              observer.next('success');
            },
            err => {
              this.storage.delete('address');
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
    this.storage.delete('token');
    this.storage.delete('address');
    this.storage.delete('secret');
    this.storage.delete('email');
    this.storage.delete('isLoggedin');
    this.router.navigate(['/login']);
    this.loggedin.next(false);
  }
}
