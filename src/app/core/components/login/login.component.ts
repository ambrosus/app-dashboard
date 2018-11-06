import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MatDialog } from '@angular/material';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { UsersService } from 'app/services/users.service';
import { StorageService } from 'app/services/storage.service';

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
    secretForm?: FormGroup
  } = {};
  error;
  deviceInfo;
  promiseAction;
  forgotPassword;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private usersService: UsersService,
    private storageService: StorageService,
  ) {
    this.forms.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    });
    this.forms.secretForm = new FormGroup({
      secret: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.getUserSub) { this.getUserSub.unsubscribe(); }
  }

  verifyAccount() {
    this.error = false;
    this.forgotPassword = false;
    const _data = this.forms.secretForm.value;

    if (!this.forms.secretForm.valid) { return this.error = 'Secret is required'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.verifyAccount(_data.secret).subscribe(
        ({ data }: any) => {
          this.storageService.set('secret', _data.secret);

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
    this.error = false;
    this.forgotPassword = false;
    const data = this.forms.loginForm.value;

    if (!this.forms.loginForm.valid) { return this.error = 'All fields are required'; }

    this.promiseAction = new Promise((resolve, reject) => {
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
