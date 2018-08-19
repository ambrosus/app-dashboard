import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  constructor(private storage: StorageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.storage.get('token');
    const { address } = <any>this.storage.get('user') || <any>{};
    const secret = this.storage.get('secret');
    const hermes: any = this.storage.get('hermes') || <any>{};

    let request: HttpRequest<any> = req.clone();

    if (req.url === `${hermes.url}/accounts/${address}`) {
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

    return next.handle(request);
  }
}
