import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot} from "@angular/router";
import {AuthService} from "app/services/auth.service";
import {Observable} from "rxjs";


@Injectable()
export class AuthGuard implements CanActivateChild {

  constructor(private router: Router,
    private auth: AuthService) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return new Promise((resolve) => {
      this.auth.address().subscribe(
        (resp: any) => {
          resolve(true);
        },
        () => {
          this.router.navigate(['/login']);
          resolve(false);
        }
      );
    });
  }
}
