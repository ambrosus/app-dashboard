import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare let Web3: any;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  web3;

  constructor(private http: HttpClient) {
    this.web3 = new Web3();
  }

  getHermeses() {
    return new Observable(observer => {
      this.http.get('/api/hermeses').subscribe(
        (user: any) => { observer.next(user); },
        err => { observer.error(err); }
      );
    });
  }

  initSetup(data) {

    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));

    data.user.token = JSON.stringify(this.web3.eth.accounts.encrypt(privateKey, data.user.password));
    data.user.address = address;

    return new Observable(observer => {

      this.http.post('/api/setup', data).subscribe(
        (resp: any) => {
          observer.next({
            address,
            secret: privateKey,
          });
        },
        err => {
          const error = err.error.message ? err.error.message : 'Setup error';
          console.log('Setup error: ', error);
          observer.error(error);
        }
      );
    });

  }
}
