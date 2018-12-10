import { AssetsService } from './assets.service';
import { Observable } from 'rxjs';
import { map, first, catchError } from 'rxjs/operators';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AssetResolver implements Resolve<any> {

  constructor(
    private assetService: AssetsService,
    private router: Router,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any {
    return this.assetService.getAsset(route.params.assetid).pipe(
      catchError(error => {
        console.error(error);
        this.router.navigate(['/assets']);
        return error;
      }),
      map(asset => asset),
      first(),
    );
  }
}
