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
      if (routeURL.includes(key)) { permissions.push(this.routesPermissions[key]); }
      return permissions;
    }, []);
  }

  checkPermission(userPermissions: string[], routePermission: string[]): boolean {
    return routePermission.every(route_permission => userPermissions.some(user_permission => user_permission === route_permission));
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

    console.log('canActivate@PermissionsGuard');
    const user: any = this.storageService.get('user');

    return new Promise(resolve => {
      this.userService.getUser(user.email).subscribe((_user: any) => {
        if (this.checkPermission(_user.permissions, this.getRoutePermissions(state.url))) { return resolve(true); }
        this.router.navigate(['/']);
        resolve(false);
      });
    });
  }
}
