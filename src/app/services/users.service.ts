import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) {
    this.getRoles();
  }

  /* User */


  update(address, json) {
    return new Observable(observer => {
      this.http.put(`/api/users/${address}`, json).subscribe(
        resp => {
          console.log('PUST / update user settings success: ', resp);
          return observer.next(resp);
        },
        err => {
          console.log('PUT / update user settings failed: ', err);
          return observer.error(err);
        }
      );
    });
  }
  /* Roles */

  private _roles: BehaviorSubject<any> = new BehaviorSubject([]);

  get roles() {
    return this._roles.asObservable();
  }

  getRoles() {
    this.http.get('/api/roles').subscribe(
      (roles: any) => {
        this._roles.next(roles);
      },
      err => {
        console.log(err);
      }
    );
  }

  createRole(json) {

    return new Observable(observer => {
      this.http.post('/api/roles', json).subscribe(role => {

        this._roles.next([...this._roles.getValue(), role]);

        observer.next();
      });

    });

  }

  updateRole(id, json) {
    return new Observable(observer => {
      this.http.put(`/api/roles/${id}`, json).subscribe((role: any) => {

        console.log(role);

        const roles = [...this._roles.getValue()].map(r => {
          if (r._id === id) {
            return role;
          }
          return r;
        });

        this._roles.next(roles);
        observer.next();
      });

    })
  }

  deleteRole(id) {
    console.log(id);
    return new Observable(observer => {
      this.http.delete(`/api/roles/${id}`).subscribe(() => {

        console.log('deteted');

        const roles = [...this._roles.getValue()].filter(r => r._id !== id);

        this._roles.next(roles);
        observer.next();
      }, err => {
        console.log(err);
      });


    })
  }

  createUser(body, token) {
    const url = `/api/users?token=${token}`;
    return new Observable(observer => {
      this.http.post(url, body).subscribe(
        (resp: any) => observer.next(resp),
        (err) => { console.log('Create account error: ', err); observer.error(err); }
      );
    });
  }

}
