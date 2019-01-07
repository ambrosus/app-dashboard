import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from 'app/services/accounts.service';
import { MessageService } from 'app/services/message.service';
import { checkEmail, checkPassword, checkText, comparePasswords, checkTimeZone } from '../../../util';
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
      fullName: new FormControl(this.account.fullName, [checkText(false)]),
      email: new FormControl(this.account.email, [checkEmail(false)]),
      timeZone: new FormControl(this.account.timeZone, [checkTimeZone(false)]),
      password: new FormControl('', [checkPassword()]),
      passwordConfirm: new FormControl('', [comparePasswords()]),
    });

    console.log(this.forms.edit);

    this.timezones = moment.tz.names();
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

        delete data.password;
        delete data.passwordConfirm;

        const body = {};
        Object.keys(data).map(prop => {
          if (data[prop] && (data[prop] !== this.account[prop])) {
            body[prop] = data[prop];
          }
        });
        console.log('(Account settings) body: ', body);

        this.account = await this.accountsService.modifyAccount(this.account.address, body);
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
