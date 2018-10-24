import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  _user = new BehaviorSubject({});

  constructor(private http: HttpClient, private storageService: StorageService) {
    const user = <any>this.storageService.get('user') || {};
    this._user.next(user);
  }

  /* User */

  updateProfile(body) {
    const user: any = this.storageService.get('user');
    return new Observable(observer => {
      this.http.put(`/api/users/${user.email}?address=${user.address}`, body).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error),
      );
    });
  }

  createUser(body) {
    const url = `/api/users`;

    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => observer.next(data),
        err => { console.error('Account CREATE error: ', err.error); observer.error(err.error); },
      );
    });
  }

  getUser(email) {
    return new Observable(observer => {
      const url = `/api/users/${email}`;

      this.http.get(url).subscribe(
        ({ data }: any) => {
          this._user.next(data);
          return observer.next(data);
        },
        err => observer.error(err.error),
      );
    });
  }

  getUsers() {
    const user: any = this.storageService.get('user');
    const url = `/api/users?organization=${user.organization._id}`;
    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error),
      );
    });
  }
}
