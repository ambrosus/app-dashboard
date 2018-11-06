import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MatDialog } from '@angular/material';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { UsersService } from 'app/services/users.service';
import { StorageService } from 'app/services/storage.service';

declare let Web3: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit, OnDestroy {
  getUserSub: Subscription;
  forms: {
    loginForm?: FormGroup,
    privateKeyForm?: FormGroup
  } = {};
  error;
  deviceInfo;
  promiseActionPrivateKeyForm;
  promiseActionLoginForm;
  forgotPassword;
  showPassword;
  errorPrivateKeyForm;
  errorLoginForm;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private usersService: UsersService,
    private storageService: StorageService,
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

  ngOnDestroy() {
    if (this.getUserSub) { this.getUserSub.unsubscribe(); }
  }

  verifyAccount() {
    this.errorPrivateKeyForm = false;
    this.forgotPassword = false;
    const _data = this.forms.privateKeyForm.value;

    if (this.forms.privateKeyForm.invalid) { return this.errorPrivateKeyForm = 'Fill all required fileds'; }

    this.promiseActionPrivateKeyForm = new Promise((resolve, reject) => {
      this.authService.verifyAccount(_data.privateKey).subscribe(
        ({ data }: any) => {
          this.storageService.set('secret', _data.privateKey);

          this.getUserSub = this.usersService.getUser('me').subscribe(
            (resp: any) => {
              this.storageService.set('user', resp);
              this.usersService._user.next(resp);
              this.router.navigate(['/assets']);
              resolve();
            },
            err => {
              console.error('[GET] User: ', err);
              this.router.navigate(['/assets']);
              resolve();
            },
          );
        }, err => {
          this.error = err.message;
          reject();
        });
    });
  }

  login() {
    this.errorLoginForm = false;
    this.forgotPassword = false;
    const data = this.forms.loginForm.value;

    if (!this.forms.loginForm.valid) { return this.errorLoginForm = 'All fields are required'; }

    this.promiseActionLoginForm = new Promise((resolve, reject) => {
      this.authService.login(data.email, data.password).subscribe(
        resp => {
          this.getUserSub = this.usersService.getUser('me').subscribe(
            (user: any) => {
              console.log('[GET] User: ', user);
              this.storageService.set('user', user);
              this.router.navigate(['/assets']);
              resolve();
            },
            err => {
              console.error('[GET] User: ', err);
              resolve();
            },
          );
        }, err => {
          console.error('[LOGIN] Error: ', err);
          this.error = err.message;
          reject();
        });
    });
  }
}
