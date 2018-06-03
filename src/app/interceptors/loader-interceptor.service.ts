import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {StorageService} from '../services/storage.service';
import {environment} from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptor implements HttpInterceptor {

  // HttpCall interceptor
  // to start and stop youtube like, top loader indicator

  constructor(private storage: StorageService) {
    // private loader: NgProgress
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // start loader
    // this.loader.start();
    const token = this.storage.get('token');

    let request: HttpRequest<any> = req.clone();

    if (req.url !== environment.apiUrls.token) {
      request = req.clone({
        headers: new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type':  'application/json',
          'Authorization': `AMB_TOKEN ${token}`
        })
      });
    }

    return next.handle(request).pipe(
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
