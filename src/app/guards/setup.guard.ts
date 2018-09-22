import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Hermes {
  data: any;
  status: number,
  totalCount: number;
}

@Injectable()
export class SetUpGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient) { }

  canActivate(): Promise<boolean> {

    console.log('canActivate@SetUpGuard');

    return new Promise((resolve) => {
      this.http.get('/api/hermeses').subscribe((res: Hermes) => {

        if (res.data && res.data.length > 0) {
          this.router.navigate(['/login']);
          resolve(false);
        } else {
          resolve(true);
        }

      });
    });

  }
}
