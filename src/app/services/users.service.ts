import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  apiEndpoint = '/api/users/';

  constructor(private http: HttpClient) { }

  update(address, json) {
    return new Observable(observer => {
      const url = `${this.apiEndpoint}${address}`;

      this.http.put(url, json).subscribe(
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

  get(email = false) {
    return new Observable(observer => {

    });
  }

  getAll() {
    return new Observable(observer => {

    });
  }
}
