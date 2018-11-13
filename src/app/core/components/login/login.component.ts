import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MatDialog } from '@angular/material';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { AccountsService } from 'app/services/accounts.service';
import { StorageService } from 'app/services/storage.service';

declare let Web3: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit, OnDestroy {
  getAccountSub: Subscription;
  loginSub: Subscription;
  forms: {
    loginForm?: FormGroup;
    privateKeyForm?: FormGroup;
  } = {};
  promiseActionPrivateKeyForm;
  promiseActionLoginForm;
  showPassword;
  errorPrivateKeyForm;
  errorLoginForm;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private accountsService: AccountsService,
    private storageService: StorageService,
  ) {
    this.forms.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, this.validateEmail]),
      password: new FormControl(null, [Validators.required]),
    });
    this.forms.privateKeyForm = new FormGroup({
      privateKey: new FormControl(null, [
        Validators.required,
        this.validatePrivateKey,
      ]),
    });
  }

  ngOnInit() {
    console.log('LOGIN');
  }

  validatePrivateKey(control: AbstractControl) {
    try {
      const web3 = new Web3();
      console.log(web3.eth.accounts.privateKeyToAccount(control.value).address);
      return null;
    } catch (e) {
      return { 'Private key is invalid': control.value };
    }
  }

  validateEmail(control: AbstractControl) {
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailPattern.test(control.value)) {
      return { 'Email is invalid': control.value };
    }
    return null;
  }

  ngOnDestroy() {
    if (this.getAccountSub) {
      this.getAccountSub.unsubscribe();
    }
    if (this.loginSub) {
      this.loginSub.unsubscribe();
    }
  }

  // Private key form

  getAccount() {
    this.errorPrivateKeyForm = false;
    const form = this.forms.privateKeyForm;

    if (form.invalid) {
      return (this.errorPrivateKeyForm = 'Fill all required fileds');
    }

    const { privateKey } = form.value;
    const address = this.authService.privateKeyToAccount(privateKey);
    this.storageService.set('secret', privateKey);
    this.storageService.set('token', this.authService.getToken());

    this.promiseActionPrivateKeyForm = new Promise((resolve, reject) => {
      this.getAccountSub = this.accountsService.getAccount(address).subscribe(
        account => {
          console.log('[GET] Account: ', account);
          this.storageService.set('secret', privateKey);
          this.storageService.set('account', account);
          this.accountsService._account.next(account);
          this.router.navigate(['/assets']);
          resolve();
        },
        err => {
          console.error('[GET] Account: ', err);
          this.errorPrivateKeyForm = err ? err.message : 'Login error';
          this.storageService.clear();
          reject();
        },
      );
    });
  }

  // Login form

  login() {
    this.errorLoginForm = false;
    const form = this.forms.loginForm;

    if (form.invalid) {
      return (this.errorLoginForm = 'All fields are required');
    }

    const { email, password } = form.value;

    this.promiseActionLoginForm = new Promise((resolve, reject) => {
      this.loginSub = this.authService.login(email, password).subscribe(
        resp => resolve(),
        err => {
          console.error('[LOGIN] Error: ', err);
          this.errorLoginForm = err
            ? err.message
            : 'Email or password are incorrect';
          reject();
        },
      );
    });
  }
}
