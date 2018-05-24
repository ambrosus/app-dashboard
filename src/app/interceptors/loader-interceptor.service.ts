import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptor implements HttpInterceptor {

  // HttpCall interceptor
  // to start and stop youtube like, top loader indicator

  constructor() {
    // private loader: NgProgress
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // start loader
    //this.loader.start();

    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // this.loader.complete();
          }
        },
        (err: any) => {
          // this.loader.complete();
        }
      )
    );
  }
}
