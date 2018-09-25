import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Hermes {
  data: any;
  status: number,
  totalCount: number;
}

@Injectable()
export class SetUpGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    console.log('canActivate@SetUpGuard');

    return new Promise((resolve) => {
      this.http.get('/api/hermeses').subscribe((res: Hermes) => {

        if (state.url === '/login' && res.totalCount === 0) {
          this.router.navigate(['/setup']);
          resolve(false);
        } else if (state.url === '/setup' && res.totalCount > 0) {
          this.router.navigate(['/login']);
          resolve(false);
        }

        resolve(true);

      });
    });

  }
}
