import { AssetsService } from '../services/assets.service';
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
export class EventResolver implements Resolve<any> {

  constructor(
    private assetsService: AssetsService,
    private router: Router,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any {
    return this.assetsService.getEvent(route.params.eventid).pipe(
      catchError(error => {
        console.error(error);
        this.router.navigate(['/assets']);
        return error;
      }),
      map(event => event),
      first(),
    );
  }
}
