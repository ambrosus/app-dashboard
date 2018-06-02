import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedin: Subject<boolean> = new Subject<boolean>();
  cleanForm: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router) { }

  createToken(secret: string) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `AMB ${secret}`
    };

    const params = {
      'validUntil': 1600000000
    };

    return this.http.post(environment.apiUrls.token, params, {headers});
  }

  address() {
    const token = localStorage.getItem('token');
    const address = localStorage.getItem('address');

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `AMB_TOKEN ${token}`
    };

    const url = environment.apiUrls.address + address;

    return this.http.get(url,{headers});
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('address');
    this.router.navigate(['/login']);
    this.loggedin.next(false);
  }
}
