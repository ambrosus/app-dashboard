import { AuthService } from 'app/services/auth.service';
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SigninComponent {
  loginForm: FormGroup;
  addressForm: FormGroup;

  error = false;
  spinner = false;
  loginFailed = false;

  // email or address
  email = true;
  address = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: StorageService,
    private http: HttpClient,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    });
    this.addressForm = new FormGroup({
      address: new FormControl(null, [Validators.required]),
      secret: new FormControl(null, [Validators.required])
    });
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
    this.loginFailed = false;
  }

  loginAddress() {
    const address = this.addressForm.get('address').value;
    const secret = this.addressForm.get('secret').value;

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
          this.error = true;
          this.loginFailed = true;
          console.log('Login error: ', err);
        }
      );
    } else {
      this.error = true;
    }
  }

  loginEmail() {
    const email = this.loginForm.get('email').value;
    const password = this.loginForm.get('password').value;

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
          const address = resp.address;
          const secret = resp.secret;

          this.auth.login(address, secret).subscribe(
            r => {
              this.spinner = false;
              this.router.navigate(['/assets']);
            },
            e => {
              this.spinner = false;
              this.error = true;
              this.loginFailed = true;
              console.log('Login failed: ', e);
            }
          );
        },
        err => {
          this.spinner = false;
          this.error = true;
          this.loginFailed = true;
          console.log('Email check failed: ', err);
        }
      );
    } else {
      this.error = true;
    }
  }
}
