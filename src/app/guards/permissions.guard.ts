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

    const { permissions } = <any>this.storageService.get('account');

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

    const { permissions } = <any>this.storageService.get('account');

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
