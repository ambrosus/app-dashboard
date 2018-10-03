import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { DashboardService } from 'app/services/dashboard.service';

import { HttpResponse } from './response.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: AuthService,
    private dashboard: DashboardService
  ) { }

  canActivate(): Promise<boolean> {

    const state: RouterStateSnapshot = arguments[1];

    console.log('canActivate@AuthGuard');

    return new Promise((resolve) => {
      this.dashboard.getHermeses().subscribe((hermeses: HttpResponse) => {

        if (state.url === '/login' && hermeses.totalCount === 0) {
          this.router.navigate(['/setup']);
          resolve(false);
        } else if (state.url === '/setup' && hermeses.totalCount > 0) {
          this.router.navigate(['/login']);
          resolve(false);
        } else if (state.url === '/login' && hermeses.totalCount > 0 && this.auth.isLoggedIn()) {
          this.router.navigate(['/assets']);
          resolve(true);
        }

        resolve(true);

      });
    });

  }
}
