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
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  CanActivateChild,
} from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class PermissionsGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private storageService: StorageService,
  ) { }

  checkPermission(
    accountPermissions: string[],
    routePermissions: string[],
  ): boolean {
    return routePermissions.every(routePermission =>
      accountPermissions.some(
        accountPermission => accountPermission === routePermission,
      ),
    );
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | Observable<boolean> | Promise<boolean> {

    const account = <any>this.storageService.get('account') || {};
    const permissions = account.permissions || [];

    return new Promise(resolve => {
      const requiredPermissions = route.data.permissions || [];
      const accountPermissions = permissions || [];

      const hasPermissions = this.checkPermission(
        accountPermissions,
        requiredPermissions,
      );
      if (!requiredPermissions.length || hasPermissions) {
        return resolve(true);
      } else if (!hasPermissions) {
        this.router.navigate(['/']);
        return resolve(false);
      }
    });
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | Observable<boolean> | Promise<boolean> {

    const account = <any>this.storageService.get('account') || {};
    const permissions = account.permissions || [];

    return new Promise(resolve => {
      const requiredPermissions = route.data.permissions || [];
      const accountPermissions = permissions || [];

      const hasPermissions = this.checkPermission(
        accountPermissions,
        requiredPermissions,
      );
      if (!requiredPermissions.length || hasPermissions) {
        return resolve(true);
      } else if (!hasPermissions) {
        this.router.navigate(['/']);
        return resolve(false);
      }
    });
  }
}
