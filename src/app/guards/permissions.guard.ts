import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from './response.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService, private http: HttpClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

    console.log('canActivate@PermissionsGuard');

    return new Promise(resolve => {
      this.http.get('/api/users').subscribe((res: HttpResponse) => {
        resolve(true);
        // if (res.data[0].role && res.data[0].role.permissions) {
        //   const permissions = res.data[0].role.permissions;
        //   if (this.checkPermission(permissions, this.getRoutePermission(state.url))) {
        //     resolve(true);
        //   } else {
        //     this.router.navigate(['/assets']);
        //     resolve(false);
        //   }
        // } else if (res.data[0] && res.data[0].company && res.data[0].company._id) {
        //   const companyId = res.data[0].company._id;
        //   const userId = res.data[0]._id;
        //   if (this.checkOwnership(companyId, userId)) {
        //     resolve(true);
        //   } else {
        //     this.router.navigate(['/assets']);
        //     resolve(false);
        //   }
        // } else { resolve(false); }
      });
    });
  }

  getRoutePermission(route: string): string {
    if (route === '/administration/users/all') {
      return 'users';
    } else if (route === '/administration/users/invite' || route === '/administration/users/invite') {
      return 'invites';
    } else if (route === '/administration/users/roles') {
      return 'roles';
    }
  }

  checkPermission(permissions: string[], routePermission: string): boolean {
    const validPermission = permissions.filter(permission => permission === routePermission);
    if (!validPermission.length) {
      return false;
    } else {
      return true;
    }
  }

  checkOwnership(companyId: string, userId: string): boolean {
    // We need to find a way to check ownership of a user
    // Attn. Required
    return true;
  }

}
