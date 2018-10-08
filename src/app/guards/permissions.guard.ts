import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from './response.interface';
import { UsersService } from './../services/users.service';
import { StorageService } from 'app/services/storage.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService, private http: HttpClient, private userService: UsersService) { }

  routePermission = {
    '/administration/users/all': 'users',
    '/administration/users/invite': 'invites',
    '/administration/users/invites': 'invites',
    '/administration/users/roles': 'roles',
  };

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

    console.log('canActivate@PermissionsGuard');
    const user: any = this.storageService.get('user');

    return new Promise(resolve => {
      this.userService.getUser(user.email).subscribe((res: HttpResponse) => {
        // this.http.get('/api/users').subscribe((res: HttpResponse) => {
        resolve(true);
        // if (res.data[0].role && res.data[0].role.permissions) {
        //   const permissions = res.data[0].role.permissions;
        //   if (this.checkPermission(permissions, this.routePermission[state.url])) {
        //     resolve(true);
        //   } else {
        //     this.router.navigate(['/assets']);
        //     resolve(false);
        //   }
        // } else { resolve(false); }
      });
    });
  }

  checkPermission(permissions: string[], routePermission: string): boolean {
    return permissions.find(permission => permission === routePermission) ? true : false;
  }

}
