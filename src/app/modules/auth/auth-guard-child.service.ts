import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot} from "@angular/router";
import {AuthService} from "app/services/auth.service";
import {Observable} from "rxjs";


@Injectable()
export class AuthGuardChild implements CanActivateChild {

  constructor(private router: Router,
    private auth: AuthService) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return new Promise((resolve) => {
      if (this.auth.isLoggedIn()) {
        resolve(true);
      } else {
        this.router.navigate(['/login']);
        resolve(false);
      }
    });
  }
}
