import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

    console.log('canActivate@PermissionsGuard');

    return new Promise(resolve => {
      if (this.auth.isLoggedIn()) {
        this.router.navigate(['/assets']);
        resolve(true);
      } else {
        this.router.navigate(['/login']);
        resolve(false);
      }
    });
  }
}
