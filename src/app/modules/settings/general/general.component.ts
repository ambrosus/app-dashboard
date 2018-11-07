import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';

declare let Web3: any;

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit, OnDestroy {
  editAccountForm: FormGroup;
  editAccountSub: Subscription;
  getAccountSub: Subscription;
  error;
  success;
  spinner = false;
  account;
  timezones = [];
  web3;

  constructor(
    private storageService: StorageService,
    private accountsService: AccountsService,
  ) {
    this.web3 = new Web3();
  }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};

    this.editAccountForm = new FormGroup({
      address: new FormControl({ value: this.account.address, disabled: true }, [Validators.required]),
      fullName: new FormControl(this.account.fullName, []),
      email: new FormControl(this.account.email, []),
      timeZone: new FormControl(this.account.timeZone, []),
      password: new FormControl('', []),
      passwordConfirm: new FormControl('', [this.comparePasswords]),
    });

    this.timezones = moment.tz.names();
  }

  comparePasswords(control: FormControl) {
    try {
      const data = this.editAccountForm.value;
      if (!data.password) { return null; }

      return control.value === data.password ? null : { 'Passwords do not match': true };
    } catch (e) { return null; }
  }

  ngOnDestroy() {
    if (this.editAccountSub) { this.editAccountSub.unsubscribe(); }
    if (this.getAccountSub) { this.getAccountSub.unsubscribe(); }
  }

  editAccount() {
    this.error = false;
    this.success = false;
    const form = this.editAccountForm;
    const data = form.value;
    const secret = this.storageService.get('secret');

    if (form.invalid) { return this.error = 'Form is invalid'; }

    const body = {};
    Object.keys(data).map(property => {
      if (data[property]) { body[property] = data[property]; }
    });

    if (data.password) {
      body['token'] = btoa(JSON.stringify(this.web3.eth.accounts.encrypt(secret, data.password)));
    }

    this.editAccountSub = this.accountsService.editAccount(this.account.address, body).subscribe(
      account => {
        this.success = 'Updated';
        this.storageService.set('account', account);
        this.accountsService._account.next(account);
      },
      err => {
        console.error('[EDIT] Account: ', err);
        this.error = err ? err.message : 'Edit account error';
      },
    );
  }
}
