import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class DashboardService {

  constructor(private http: HttpClient) { }

  setup(data) {

    return new Observable(observer => {

      this.http.post('/api/setup', data).subscribe(
        (resp: any) => {
          observer.next(resp);
        },
        err => {
          const error = err.error.message ? err.error.message : 'Setup error';
          console.log('Setup error: ', error);
          observer.error(error);
        }
      );
    });

  }
}
