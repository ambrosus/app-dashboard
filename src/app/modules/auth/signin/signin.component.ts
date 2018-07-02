import { AuthService } from 'app/services/auth.service';
import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
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
export class SigninComponent implements OnInit {
  // Login form
  loginForm: FormGroup;
  error = false;
  spinner = false;
  loginFailed = false;
  // Address form
  addressForm: FormGroup;
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

  ngOnInit() {}

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

  loginAddress() {
    const address = this.addressForm.get('address').value;
    const secret = this.addressForm.get('secret').value;

    if (this.addressForm.valid) {
      this.spinner = true;
      this.error = false;
      this.loginFailed = false;

      this.auth.login(address, secret).subscribe(
        resp => {
          this.spinner = false;
          this.auth.loggedin.next(true);
          this.router.navigate(['/assets']);
        },
        err => {
          console.log(err);
          this.error = true;
          this.loginFailed = true;
          this.spinner = false;
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
      this.spinner = true;
      this.error = false;
      this.loginFailed = false;
      let address, secret;

      const body = {
        email: email,
        password: password
      };

      const url = `/api/auth/login`;

      this.http.post(url, body).subscribe(
        (_resp: any) => {
          address = _resp.address;
          secret = _resp.secret;
          this.storage.set('email', email);

          // Get the token
          this.auth.login(address, secret).subscribe(
            resp => {
              this.spinner = false;
              this.auth.loggedin.next(true);
              this.router.navigate(['/assets']);
            },
            err => {
              console.log(err);
              this.error = true;
              this.loginFailed = true;
              this.spinner = false;
              this.auth.cleanForm.next(true);
            }
          );
        },
        err => {
          console.log(err);
          this.spinner = false;
          this.error = true;
          this.loginFailed = true;
        }
      );
    } else {
      this.error = true;
    }
  }
}
