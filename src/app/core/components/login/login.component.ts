import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MatDialog } from '@angular/material';
import { AuthService } from 'app/services/auth.service';

declare let Web3: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  forms: {
    loginForm?: FormGroup,
    privateKeyForm?: FormGroup
  } = {};
  error;
  deviceInfo;
  promiseAction;
  forgotPassword;
  showPassword;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
  ) {
    this.forms.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, this.validateEmail]),
      password: new FormControl(null, [Validators.required]),
    });
    this.forms.privateKeyForm = new FormGroup({
      privateKey: new FormControl(null, [Validators.required, this.validatePrivateKey]),
    });
  }

  ngOnInit() { }

  validatePrivateKey(control: AbstractControl) {
    try {
      const web3 = new Web3();
      console.log(web3.eth.accounts.privateKeyToAccount(control.value).address);
      return null;
    } catch (e) { return { 'Invalid private key': control.value }; }
  }

  validateEmail(control: AbstractControl) {
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailPattern.test(control.value)) {
      return { 'Email is invalid': control.value };
    }
    return null;
  }

  verifyAccount() {
    this.error = false;
    this.forgotPassword = false;
    const data = this.forms.privateKeyForm.value;

    if (this.forms.privateKeyForm.invalid) { return this.error = 'Fill all required fileds'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.verifyAccount(data.privateKey).subscribe((resp: any) => {
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
    this.forgotPassword = false;
    const data = this.forms.loginForm.value;

    if (!this.forms.loginForm.valid) { return this.error = 'All fields are required'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.login(data.email, data.password).subscribe((resp: any) => {
        this.router.navigate(['/assets']);
        resolve();
      }, err => {
        this.error = err.message;
        reject();
      });
    });
  }
}
