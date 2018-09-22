import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuardLogin implements CanActivate {
  constructor(private router: Router, private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

    console.log('canActivate@AuthGuardLogin');

    return new Promise(resolve => {
      if (this.auth.isLoggedIn()) {
        resolve(false);
        this.router.navigate(['/assets']);
      } else {
        resolve(true);
      }
    });
  }
}
