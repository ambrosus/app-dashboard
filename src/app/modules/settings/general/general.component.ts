import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from 'app/services/accounts.service';
import { MessageService } from 'app/services/message.service';

declare let Web3: any;

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit {
  forms: {
    edit?: FormGroup,
  } = {};
  account;
  timezones = [];
  promise: any = {};
  web3;

  constructor(
    private storageService: StorageService,
    private accountsService: AccountsService,
    private messageService: MessageService,
  ) {
    this.web3 = new Web3();
  }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};

    this.forms.edit = new FormGroup({
      address: new FormControl(
        { value: this.account.address, disabled: true },
        [Validators.required],
      ),
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
      const data = this.forms.edit.value;
      if (!data.password) {
        return null;
      }
      return control.value === data.password ? null : { 'Passwords do not match': true };
    } catch (e) {
      return null;
    }
  }

  save() {
    this.promise['save'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.edit;
        const data = form.value;
        const secret = this.storageService.get('secret');

        if (form.invalid) {
          throw new Error('Form is invalid');
        }

        if (data.password) {
          data['token'] = btoa(JSON.stringify(this.web3.eth.accounts.encrypt(secret, data.password)));
        }

        delete data.passwordConfirm;

        this.account = await this.accountsService.modifyAccount(this.account.address, data);
        this.storageService.set('account', this.account);
        this.accountsService._account.next(this.account);

        this.messageService.success('Account updated');
        resolve();
      } catch (error) {
        console.error('[MODIFY] Account: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }
}
