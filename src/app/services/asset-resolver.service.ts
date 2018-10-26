import { AssetsService } from './assets.service';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AssetResolver implements Resolve<any> {
  constructor(private asset: AssetsService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any {
    return this.asset.getAsset(route.params.assetid).pipe(
      map(asset => asset),
      first(),
    );
  }
}
