import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UsersService } from 'app/services/users.service';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService, private userService: UsersService) { }

  routesPermissions = {
    '/administration': 'manage_organization',
    '/administration/users': 'manage_accounts',
  };

  getRoutePermissions(routeURL) {
    return Object.keys(this.routesPermissions).reduce((permissions, key, index, array) => {
      if (routeURL.indexOf(key) > -1) { permissions.push(this.routesPermissions[key]); }
      return permissions;
    }, []);
  }

  checkPermission(userPermissions: string[], routePermissions: string[]): boolean {
    return routePermissions.every(routePermission => userPermissions.some(userPermission => userPermission === routePermission));
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

    console.log('canActivate@PermissionsGuard');
    const user: any = this.storageService.get('user');

    return new Promise(resolve => {
      this.userService.getUser(user.email).subscribe((_user: any) => {
        const routePermissions = this.getRoutePermissions(state.url) || [];

        if (routePermissions.length) {
          return resolve(this.checkPermission(_user.permissions, routePermissions));
        }

        this.router.navigate(['/']);
        resolve(false);
      });
    });
  }
}
