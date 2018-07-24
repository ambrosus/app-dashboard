import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  apiEndpoint = '/api/notifications/';

  constructor(private http: HttpClient) {}

  create(address, notification) {
    return new Observable(observer => {
      const url = `${this.apiEndpoint}${address}`;
      const body = {
        notification
      };

      this.http.post(url, body).subscribe(
        resp => {
          console.log('POST / create notification success: ', resp);
          return observer.next(resp);
        },
        err => {
          console.log('POST / create notification failed: ', err);
          return observer.error(err);
        }
      );
    });
  }

  get(address) {
    return new Observable(observer => {
      const url = `${this.apiEndpoint}${address}`;

      this.http.get(url).subscribe(
        resp => {
          console.log('GET notifications success: ', resp);
          return observer.next(resp);
        },
        err => {
          console.log('GET notifications failed: ', err);
          return observer.error(err);
        }
      );
    });
  }

  viewed(address, notifications) {
    return new Observable(observer => {
      const url = `${this.apiEndpoint}${address}`;
      const body = {
        notifications
      };

      this.http.put(url, body).subscribe(
        resp => {
          console.log('PUT / viewed notifications success: ', resp);
          return observer.next(resp);
        },
        err => {
          console.log('PUT / viewed notifications failed: ', err);
          return observer.error(err);
        }
      );
    });
  }
}
