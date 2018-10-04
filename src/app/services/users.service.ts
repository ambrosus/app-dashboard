import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _roles: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private http: HttpClient) {
    this.getRoles();
  }

  /* User */

  update(address, json) {
    return new Observable(observer => {
      this.http.put(`/api/users/${address}`, json).subscribe(
        ({ data }: any) => {
          console.log('PUST / update user settings success: ', data);
          return observer.next(data);
        },
        err => {
          console.log('PUT / update user settings failed: ', err);
          return observer.error(err);
        }
      );
    });
  }

  /* Roles */

  get roles() {
    return this._roles.asObservable();
  }

  getRoles() {
    this.http.get('/api/users/roles').subscribe(
      ({ data }: any) => {
        this._roles.next(data);
      },
      err => {
        console.log(err);
      }
    );
  }

  createRole(json) {

    return new Observable(observer => {
      this.http.post('/api/users/roles', json).subscribe(({ data }: any) => {

        this._roles.next([...this._roles.getValue(), data]);

        observer.next();
      });

    });

  }

  updateRole(id, json) {
    return new Observable(observer => {
      this.http.put(`/api/users/role/${id}`, json).subscribe(({ data }: any) => {

        console.log(data);

        const roles = [...this._roles.getValue()].map(r => {
          if (r._id === id) {
            return data;
          }
          return r;
        });

        this._roles.next(roles);
        observer.next();
      });

    });
  }

  deleteRole(id) {
    console.log(id);
    return new Observable(observer => {
      this.http.delete(`/api/users/role/${id}`).subscribe(() => {

        console.log('deteted');

        const roles = [...this._roles.getValue()].filter(r => r._id !== id);

        this._roles.next(roles);
        observer.next();
      }, err => {
        console.log(err);
      });

    });
  }

  getUser() {
    return new Observable(observer => {
      this.http.get('/api/users').subscribe(
        ({ data }: any) => { observer.next(data); },
        err => { observer.error(err); }
      );
    });
  }

  createUser(body, token) {
    const url = `/api/users?token=${token}`;
    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        ({ data }: any) => observer.next(data),
        (err) => { console.log('Create account error: ', err); observer.error(err); }
      );
    });
  }

  getUsers() {
    const url = `/api/users`;
    return new Observable(observer => {
      this.http.get(url).subscribe(
        ({ data }: any) => observer.next(data),
        (err) => { observer.error(err); }
      );
    });
  }

}
