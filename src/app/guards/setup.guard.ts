import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';
import { HttpResponse } from './response.interface';

@Injectable()
export class SetUpGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient, private storage: StorageService, private auth: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    console.log('canActivate@SetUpGuard');

    return new Promise((resolve) => {
      this.http.get('/api/hermeses').subscribe((res: HttpResponse) => {

        if (state.url === '/login' && res.totalCount === 0) {
          this.router.navigate(['/setup']);
          resolve(false);
        } else if (state.url === '/setup' && res.totalCount > 0) {
          this.router.navigate(['/login']);
          resolve(false);
        } else if (state.url === '/login' && res.totalCount > 0) {
            this.storage.set('hermes', res.data[0]);
            if (this.auth.isLoggedIn()) {
              this.router.navigate(['/assets']);
              resolve(true);
            }
        }

        resolve(true);

      });
    });

  }
}
