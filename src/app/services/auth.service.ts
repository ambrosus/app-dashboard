import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedin: Subject<boolean> = new Subject<boolean>();
  cleanForm: Subject<boolean> = new Subject<boolean>();

  urls = {
    'token': 'https://gateway-dev.ambrosus.com/token',
    'address': 'https://gateway-dev.ambrosus.com/accounts/'
  };

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

    return this.http.post(this.urls.token, params, {headers});
  }

  address() {
    const token = localStorage.getItem('token');
    const address = localStorage.getItem('address');

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `AMB_TOKEN ${token}`
    };

    const url = this.urls.address + address;

    return this.http.get(url,{headers});
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.loggedin.next(false);
  }
}
