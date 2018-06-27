import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  constructor(private storage: StorageService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // this.loader.start();
    const token = this.storage.get('token') || null;
    const secret = this.storage.get('secret');
    const address = this.storage.get('address');

    let request: HttpRequest<any> = req.clone();

    if (
      req.url === `${environment.host}${environment.apiUrls.address}${address}`
    ) {
      request = req.clone({
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `AMB_TOKEN ${token}`
        })
      });
    } else {
      request = req.clone({
        headers: new HttpHeaders({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `AMB ${secret}`
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
