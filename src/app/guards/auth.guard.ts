import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivateChild } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private auth: AuthService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    return new Promise(resolve => {
      if (
        (state.url === '/login' || state.url.startsWith('/signup')) &&
        this.auth.isLoggedIn()
      ) {
        this.router.navigate(['/assets']);
        return resolve(false);
      } else if (
        !(state.url === '/login' || state.url.startsWith('/signup')) &&
        !this.auth.isLoggedIn()
      ) {
        this.router.navigate(['/login']);
        return resolve(false);
      }

      resolve(true);
    });
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

    return new Promise(resolve => {
      if (
        (state.url === '/login' || state.url.startsWith('/signup')) &&
        this.auth.isLoggedIn()
      ) {
        this.router.navigate(['/assets']);
        return resolve(false);
      } else if (
        !(state.url === '/login' || state.url.startsWith('/signup')) &&
        !this.auth.isLoggedIn()
      ) {
        this.router.navigate(['/login']);
        return resolve(false);
      }

      resolve(true);
    });
  }
}
