import { AssetsService } from './assets.service';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class EventResolver implements Resolve<any> {
  constructor(private assetsService: AssetsService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any {
    return this.assetsService.getEvent(route.params.eventid).pipe(
      map(event => event),
      first(),
    );
  }
}
