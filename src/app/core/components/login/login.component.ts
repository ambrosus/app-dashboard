/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MatDialog } from '@angular/material';
import { AuthService } from 'app/services/auth.service';
import { AccountsService } from 'app/services/accounts.service';
import { StorageService } from 'app/services/storage.service';
import { MessageService } from 'app/services/message.service';
import * as Sentry from '@sentry/browser';
import { checkPrivateKey, checkEmail } from 'app/util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  forms: {
    email?: FormGroup;
    privateKey?: FormGroup;
  } = {};
  promise: any = {};
  showPassword;

  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private accountsService: AccountsService,
    private storageService: StorageService,
    private messageService: MessageService,
  ) {
    this.forms.email = new FormGroup({
      email: new FormControl(null, [checkEmail(false)]),
      password: new FormControl(null, [Validators.required]),
    });
    this.forms.privateKey = new FormGroup({
      privateKey: new FormControl(null, [checkPrivateKey(false)]),
    });
  }

  ngOnInit() { }

  // Private key form

  getAccount() {
    this.promise['privateKey'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.privateKey;

        if (form.invalid) {
          throw new Error('Fill all required fileds');
        }

        const { privateKey } = form.value;
        const address = this.authService.privateKeyToAccount(privateKey);
        this.storageService.set('secret', privateKey);
        this.storageService.set('token', this.authService.getToken());

        const account = await this.accountsService.getAccount(address);

        this.storageService.set('secret', privateKey);
        this.storageService.set('account', account);
        Sentry.configureScope(scope => {
          scope.setUser({ account });
        });
        this.accountsService._account.next(account);
        this.authService.signupAddress = '';
        this.router.navigate(['/assets']);

        this.messageService.dismissAll();
        resolve();
      } catch (error) {
        console.error('[GET] Account: ', error);
        this.storageService.clear();
        this.messageService.error(error, 'Private key is incorrect');
        reject();
      }
    });
  }

  // Login form

  login() {
    this.promise['login'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.email;

        if (form.invalid) {
          throw new Error('All fields are required');
        }

        const { email, password } = form.value;

        const account = await this.authService.login(email, password);
        Sentry.configureScope(scope => {
          scope.setUser({ account });
        });

        this.messageService.dismissAll();
        resolve();
      } catch (error) {
        console.error('[LOGIN] Error: ', error);
        this.messageService.error(error, 'Email or password are incorrect', true);
        reject();
      }
    });
  }
}
