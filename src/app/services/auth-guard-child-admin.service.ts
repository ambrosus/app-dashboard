import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable()
export class AuthGuardChildAdmin implements CanActivateChild {

  constructor(private router: Router, private auth: AuthService, private storage: StorageService) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    const user: any = this.storage.get('user') || {};

    return new Promise(resolve => {
      if (this.auth.isLoggedIn() && (user.role.id === 1 || user.role.id === 2)) {
        resolve(true);
      } else {
        this.router.navigate(['/login']);
        resolve(false);
      }
    });
  }
}
