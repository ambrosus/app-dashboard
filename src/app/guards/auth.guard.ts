import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { DashboardService } from 'app/services/dashboard.service';

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

      if (state.url === '/login' && this.auth.isLoggedIn()) {
        this.router.navigate(['/assets']);
        return resolve(false);
      } else if (state.url !== '/login' && !this.auth.isLoggedIn()) {
        this.router.navigate(['/login']);
        return resolve(false);
      }

      resolve(true);
    });

  }
}
