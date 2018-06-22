import { AssetsService } from './assets.service';
import { Observable, of } from 'rxjs';
import { map, first } from 'rxjs/operators';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssetResolver implements Resolve<any> {
  constructor(private asset: AssetsService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    console.log(route.params.assetId);
    return this.asset.getAsset(route.params.assetId).pipe(
      map(asset => asset),
      first()
    );
  }
}
