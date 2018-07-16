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

@Injectable()
export class EventResolver implements Resolve<any> {
  constructor(private asset: AssetsService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return this.asset.getEventById(route.params.eventid).pipe(
      map(asset => asset),
      first()
    );
  }
}
