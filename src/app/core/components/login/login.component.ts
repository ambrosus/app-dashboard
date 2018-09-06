import { AuthService } from 'app/services/auth.service';
import { Component, ElementRef, Renderer2, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';

declare let Web3: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  addressForm: FormGroup;
  loginPage = true;

  error;
  spinner = false;
  alreadyLoggedIn = false;

  // email or address
  email = true;
  address = false;
  web3;
  deviceInfo;

  @Input() isDialog;

  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: StorageService,
    private http: HttpClient,
    private el: ElementRef,
    private renderer: Renderer2,
    public dialog: MatDialog
  ) {
    this.web3 = new Web3();
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    });
    this.addressForm = new FormGroup({
      address: new FormControl(null, [Validators.required]),
      secret: new FormControl(null, [Validators.required])
    });
    this.loginPage = location.pathname.includes('/login');
  }

  ngOnInit() {
    const url = `/api/hermeses`;

    this.http.get(url).subscribe(
      (resp: any) => {
        if (resp.resultCount === 0) {
          this.router.navigate(['/setup']);
        } else {
          this.storage.set('hermes', resp.data[0]);
        }
      },
      err => {
        console.log('Hermes GET error: ', err);
      }
    );
  }

  tabOpen(open, element) {
    this.email = open === 'email' ? true : false;
    this.address = open === 'address' ? true : false;
    const tabHeaderItems = this.el.nativeElement.querySelectorAll(
      '.tab_header_item'
    );
    for (const item of tabHeaderItems) {
      this.renderer.removeClass(item, 'active');
    }
    this.renderer.addClass(element, 'active');
  }

  resetErrors() {
    this.error = false;
    this.alreadyLoggedIn = false;
  }

  loginAddress() {
    const address = this.addressForm.get('address').value;
    const secret = this.addressForm.get('secret').value;

    let accounts: any = this.storage.get('accounts');
    accounts = accounts ? accounts : [];

    if (accounts.some((account) => account.address === address) && location.pathname !== '/login') {
      this.alreadyLoggedIn = true;
      return;
    }

    if (this.addressForm.valid) {
      this.resetErrors();
      this.spinner = true;

      this.auth.login(address, secret).subscribe(
        resp => {
          this.spinner = false;
          this.router.navigate(['/assets']);
        },
        err => {
          this.spinner = false;
          this.error = err.error ? err.error.message : JSON.stringify(err);
          console.log('Login error: ', err);
        }
      );
    } else {
      this.error = 'All fields are required';
    }
  }

  loginEmail() {
    const email = this.loginForm.get('email').value;
    const password = this.loginForm.get('password').value;

    let accounts: any = this.storage.get('accounts');
    accounts = accounts ? accounts : [];

    if (accounts.some((account) => account.email === email)) {
      this.alreadyLoggedIn = true;
      return;
    }

    if (this.loginForm.valid) {
      this.resetErrors();
      this.spinner = true;

      const body = {
        email,
        password
      };

      const url = `/api/auth/login`;

      this.http.post(url, body).subscribe(
        (resp: any) => {
          const token = JSON.parse(resp.token);
          const { address, privateKey } = this.web3.eth.accounts.decrypt(token, body.password);

          this.auth.login(address, privateKey).subscribe(
            r => {
              this.spinner = false;
              this.router.navigate(['/assets']);
            },
            e => {
              this.spinner = false;
              this.error = e.error ? e.error.message : JSON.stringify(e);
              console.log('Login failed: ', e);
            }
          );
        },
        err => {
          this.spinner = false;
          this.error = err.error ? err.error.message : JSON.stringify(err);
          console.log('Email check failed: ', err);
        }
      );
    } else {
      this.error = 'All fields are required';
    }
  }

  closeDialog() {
    this.dialog.closeAll();
  }

}
