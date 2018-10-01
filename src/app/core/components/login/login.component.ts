import { AuthService } from 'app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  forms: {
    loginForm?: FormGroup,
    addressForm?: FormGroup
  } = {};

  error;
  deviceInfo;
  promiseAction;

  constructor(
    private auth: AuthService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.forms.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    });
    this.forms.addressForm = new FormGroup({
      address: new FormControl(null, [Validators.required]),
      secret: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() { }

  verifyAccount() {
    this.error = false;
    const data = this.forms.addressForm.value;

    if (!this.forms.addressForm.valid) { return this.error = 'All fields are required'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.auth.verifyAccount(data.address, data.secret).subscribe((resp: any) => {
        this.router.navigate(['/assets']);
        resolve();
      }, err => {
        this.error = err.message;
        reject();
      });
    });
  }

  login() {
    this.error = false;
    const data = this.forms.loginForm.value;

    if (!this.forms.loginForm.valid) { return this.error = 'All fields are required'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.auth.login(data.email, data.password).subscribe((resp: any) => {
        this.router.navigate(['/assets']);
        resolve();
      }, err => {
        this.error = err.message;
        reject();
      });
    });
  }
}
