import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { tap } from 'rxjs/operators';
import { RequestService } from 'app/services/request.service';

@Injectable()
export class InterceptorService implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private requestService: RequestService,
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    let request: HttpRequest<any> = req.clone();
    if (request.url.indexOf('https') === -1 || request.url.indexOf('/extended') > -1) {
      this.requestService.request.start.next();
    }

    const token = this.authService.getToken();
    const tokenNotNeeded = ['/assets'];
    const useToken = !tokenNotNeeded.filter(
      route => req.url.indexOf(route) > -1,
    ).length;

    if (useToken && token) {
      request = req.clone({
        setHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: useToken ? `AMB_TOKEN ${token}` : '',
        },
      });
    }

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.requestService.request.done.next();
          }
        },
        (err: any) => {
          this.requestService.request.done.next();
        },
      ),
    );
  }
}
