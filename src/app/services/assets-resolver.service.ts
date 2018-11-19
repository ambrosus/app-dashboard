import { AssetsService } from './assets.service';
import { Observable } from 'rxjs';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class AssetsResolver implements Resolve<any> {
  constructor(private assetsService: AssetsService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any {
    return this.assetsService.getAssets({}).then();
  }
}
