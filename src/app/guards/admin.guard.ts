import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from './response.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService, private http: HttpClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {

    console.log('canActivate@AdminGuard');

    return new Promise(resolve => {
      this.http.get('/api/users').subscribe((res: HttpResponse) => {
        if (res.data[0].role && res.data[0].role.permissions) {
          resolve(true);
        } else {
          this.router.navigate(['/assets']);
          resolve(false);
        }
      });
    });
  }
}
