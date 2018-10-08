import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _roles: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient, private storageService: StorageService) {
    this.getRoles();
  }

  /* User */

  updateProfile(body) {
    const user: any = this.storageService.get('user');
    return new Observable(observer => {
      this.http.put(`/api/users/${user.email}?address=${user.address}`, body).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  changePassword(body) {
    return new Observable(observer => {
      this.http.put(`/api/users/password`, body).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  createUser(body, token) {
    const url = `/api/users?token=${token}`;
    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => observer.next(data),
        err => { console.error('Account CREATE error: ', err.error); observer.error(err.error); }
      );
    });
  }

  getUser(email) {
    return new Observable(observer => {
      const url = `/api/users/${email}`;

      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  getUsers() {
    const url = `/api/users`;
    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  /* Roles */

  get roles() { return this._roles.asObservable(); }

  getRoles() {
    this.http.get('/api/users/roles').subscribe(
      ({ data }: any) => this._roles.next(data),
      err => console.error('Roles GET error: ', err.error)
    );
  }

  createRole(json) {
    return new Observable(observer => {
      this.http.post('/api/users/roles', json).subscribe(
        ({ data }: any) => {
          this._roles.next([...this._roles.getValue(), data]);
          observer.next();
        },
        err => observer.error(err.error)
      );
    });
  }

  updateRole(id, json) {
    return new Observable(observer => {
      this.http.put(`/api/users/role/${id}`, json).subscribe(
        ({ data }: any) => {
          const roles = [...this._roles.getValue()].map(r => {
            if (r._id === id) { return data; }
            return r;
          });
          this._roles.next(roles);
          observer.next();
        },
        err => observer.error(err.error)
      );
    });
  }

  deleteRole(id) {
    return new Observable(observer => {
      this.http.delete(`/api/users/role/${id}`).subscribe(
        () => {
          const roles = [...this._roles.getValue()].filter(r => r._id !== id);
          this._roles.next(roles);
          observer.next();
        },
        err => console.error('Roles DELETE error: ', err.error));
    });
  }

  /* Sessions */

  getSessions() {
    return new Observable(observer => {
      this.http.get('/api/auth/sessions').subscribe(
        ({ data }: any) => observer.next(data),
        err => observer.error(err.error)
      );
    });
  }

  logoutSession(sessionId) {
    return new Observable(observer => {
      this.http.delete(`/api/auth/sessions/${sessionId}`).subscribe(
        resp => observer.next(resp),
        err => observer.error(err.error)
      );
    });
  }

  logoutOfAllDevices() {
    return new Observable(observer => {
      this.http.delete(`/api/auth/sessions`).subscribe(
        resp => observer.next(resp),
        err => observer.error(err.error)
      );
    });
  }
}
