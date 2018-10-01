import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MatDialog } from '@angular/material';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  addressForm: FormGroup;

  error;
  deviceInfo;
  promiseAction;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
  ) {

    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    });
    this.addressForm = new FormGroup({
      address: new FormControl(null, [Validators.required]),
      secret: new FormControl(null, [Validators.required]),
    });

  }

  ngOnInit() {
  }


  verifyAccount() {
    const address = this.addressForm.get('address').value;
    const secret = this.addressForm.get('secret').value;

    if (this.addressForm.valid) {
      this.error = false;
    } else {
      this.error = 'All fields are required';
      return false;
    }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.verifyAccount(address, secret).subscribe((resp: any) => {
        this.router.navigate(['/assets']);
        resolve();
      }, err => {
        this.error = err;
        reject();
      });
    });

  }

  login() {

    const email = this.loginForm.get('email').value;
    const password = this.loginForm.get('password').value;

    if (this.loginForm.valid) {
      this.error = false;
    } else {
      this.error = 'All fields are required';
      return false;
    }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.login(email, password).subscribe((resp: any) => {

        console.log(resp);

        this.router.navigate(['/assets']);
        resolve();
      }, err => {
        this.error = err;
        reject();
      });
    });
  }


}
