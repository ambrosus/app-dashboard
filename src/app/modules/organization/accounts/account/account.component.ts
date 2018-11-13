import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  getAccountSub: Subscription;
  modifyAccountSub: Subscription;
  routeSub: Subscription;
  forms: {
    account?: FormGroup,
    accountPermissions?: FormGroup,
  } = {};
  account;
  address;
  timezones = [];
  error;
  success;

  constructor(
    private accountsService: AccountsService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.address = params.address;
      this.getAccount();
      this.timezones = moment.tz.names();
    });
  }

  ngOnDestroy() {
    if (this.getAccountSub) { this.getAccountSub.unsubscribe(); }
    if (this.modifyAccountSub) { this.modifyAccountSub.unsubscribe(); }
  }

  initForms() {
    this.forms.account = new FormGroup({
      address: new FormControl({ value: this.account.address, disabled: true }),
      fullName: new FormControl(this.account.fullName),
      email: new FormControl(this.account.email),
      timeZone: new FormControl(this.account.timeZone),
    });

    this.forms.accountPermissions = new FormGroup({
      accessLevel: new FormControl(this.account.accessLevel, [Validators.required]),
      permissions: new FormGroup({
        'manage_accounts': new FormControl(null),
        'register_accounts': new FormControl(null),
        'create_event': new FormControl(null),
        'create_asset': new FormControl(null),
      }),
    });
    this.account.permissions.map(permission => this.forms.accountPermissions.get('permissions').get(permission).setValue(true));
  }

  getAccount() {
    this.getAccountSub = this.accountsService.getAccount(this.address).subscribe(
      account => {
        console.log('[GET] Account: ', account);
        this.account = account;
        this.initForms();
      },
      err => this.router.navigate(['/organization/accounts']),
    );
  }

  modifyAccount() {
    this.error = false;
    this.success = false;
    const form = this.forms.account;
    const data = form.value;
    const body = {};

    if (form.invalid) { this.error = 'Form is invalid'; }

    Object.keys(data).map(property => {
      if (data[property]) { body[property] = data[property]; }
    });

    this.modifyAccountSub = this.accountsService.modifyAccount(this.account.address, body).subscribe(
      account => {
        console.log('[MODIFY] Account ', account);
        this.getAccount();
      },
      err => {
        console.error('[MODIFY] Account: ', err);
        this.error = 'Account update failed';
      },
    );
  }

  modifyPermissions() {
    this.error = false;
    this.success = false;
    const form = this.forms.accountPermissions;
    const data = form.value;
    const body = { accessLevel: data.accessLevel, permissions: [] };

    if (form.invalid) { this.error = 'Form is invalid'; }

    Object.keys(data.permissions).map(permission => {
      if (data.permissions[permission]) {
        body.permissions.push(permission);
      }
    });

    this.modifyAccountSub = this.accountsService.modifyAccount(this.account.address, body).subscribe(
      account => {
        console.log('[MODIFY] Account ', account);
        this.getAccount();
      },
      err => {
        console.error('[MODIFY] Account: ', err);
        this.error = 'Account update failed';
      },
    );
  }
}
