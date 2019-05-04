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

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';
import { MessageService } from 'app/services/message.service';
import { checkText, checkEmail, checkTimeZone } from 'app/util';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AccountComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  forms: {
    account?: FormGroup;
    accountPermissions?: FormGroup;
  } = {};
  account: any = {
    permissions: [],
  };
  address;
  timezones = [];
  promise: any = {};

  constructor(
    private accountsService: AccountsService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.initForms();
    this.subs[this.subs.length] = this.route.params.subscribe(params => this.address = params.address);
    this.getAccount().then();
    this.timezones = moment.tz.names();
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  initForms() {
    this.forms.account = new FormGroup({
      address: new FormControl({ value: this.account.address, disabled: true }),
      fullName: new FormControl(this.account.fullName, [checkText({ allowEmpty: false })]),
      email: new FormControl(this.account.email, [checkEmail(false)]),
      timeZone: new FormControl(this.account.timeZone, [checkTimeZone(false)]),
    });

    this.forms.accountPermissions = new FormGroup({
      accessLevel: new FormControl(this.account.accessLevel, [Validators.required]),
      permissions: new FormGroup({
        super_account: new FormControl({ value: null, disabled: true }),
        manage_accounts: new FormControl(null),
        register_accounts: new FormControl(null),
        create_event: new FormControl(null),
        create_asset: new FormControl(null),
      }),
    });
    try {
      this.account.permissions.map(permission =>
        this.forms.accountPermissions
          .get('permissions')
          .get(permission)
          .setValue(true),
      );
    } catch (e) { }
  }

  async getAccount(): Promise<any> {
    try {
      this.account = await this.accountsService.getAccount(this.address);
      this.initForms();
      console.log('[GET] Account: ', this.account);
    } catch (error) {
      this.router.navigate(['/organization/accounts']);
    }
  }

  saveAccount() {
    this.promise['saveAccount'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.account;
        const data = form.value;

        if (form.invalid) {
          throw new Error('Form is invalid');
        }

        const body = {};
        Object.keys(data).map(prop => {
          if (data[prop] && (data[prop] !== this.account[prop])) {
            body[prop] = data[prop];
          }
        });
        console.log('(Organization account settings) body: ', body);

        const account = await this.accountsService.modifyAccount(this.account.address, body);
        await this.getAccount();

        this.messageService.success('Account details updated');

        resolve();
      } catch (error) {
        console.error('[MODIFY] Account: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }

  savePermissions() {
    this.promise['savePermissions'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.accountPermissions;
        const data = form.getRawValue();
        const body = { accessLevel: data.accessLevel, permissions: [] };

        if (form.invalid) {
          throw new Error('Form is invalid');
        }

        Object.keys(data.permissions).map(permission => {
          if (data.permissions[permission]) {
            body.permissions.push(permission);
          }
        });

        const account = await this.accountsService.modifyAccount(this.account.address, body);
        await this.getAccount();

        this.messageService.success('Account permissions updated');

        resolve();
      } catch (error) {
        console.error('[MODIFY] Account: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }
}
