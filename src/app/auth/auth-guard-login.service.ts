import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {AuthService} from "../services/auth.service";
import {Observable} from "rxjs";


@Injectable()
export class AuthGuardLogin implements CanActivate {

  constructor(private router: Router,
    private auth: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return new Promise((resolve) => {
      this.auth.address().subscribe(
        (resp: any) => {
          resolve(false);
          this.router.navigate(['/dashboard']);
        },
        () => {
          resolve(true);
        }
      );
    });
  }
}
