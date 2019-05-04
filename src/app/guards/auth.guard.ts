/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
        (state.url === '/login' || state.url.indexOf('/signup') > -1) &&
        this.auth.isLoggedIn()
      ) {
        this.router.navigate(['/assets']);
        return resolve(false);
      } else if (
        !(state.url === '/login' || state.url.indexOf('/signup') > -1) &&
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
        (state.url === '/login' || state.url.indexOf('/signup') > -1) &&
        this.auth.isLoggedIn()
      ) {
        this.router.navigate(['/assets']);
        return resolve(false);
      } else if (
        !(state.url === '/login' || state.url.indexOf('/signup') > -1) &&
        !this.auth.isLoggedIn()
      ) {
        this.router.navigate(['/login']);
        return resolve(false);
      }

      resolve(true);
    });
  }
}
