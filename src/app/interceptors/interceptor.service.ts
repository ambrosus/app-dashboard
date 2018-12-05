import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/services/auth.service';

@Injectable()
export class InterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    let request: HttpRequest<any> = req.clone();

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

    console.log('REQUEST: ', request);

    return next.handle(request);
  }
}
