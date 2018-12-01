import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';

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
  error;
  success;

  constructor(
    private accountsService: AccountsService,
    private route: ActivatedRoute,
    private router: Router,
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
      fullName: new FormControl(this.account.fullName),
      email: new FormControl(this.account.email),
      timeZone: new FormControl(this.account.timeZone),
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

  async saveAccount(): Promise<any> {
    const form = this.forms.account;
    const data = form.value;
    const body = {};

    if (form.invalid) {
      this.error = 'Form is invalid';
    }

    Object.keys(data).map(p => {
      if (data[p]) {
        body[p] = data[p];
      }
    });

    try {
      const account = await this.accountsService.modifyAccount(this.account.address, body);
      console.log('[MODIFY] Account ', account);
      this.getAccount();
    } catch (error) {
      console.error('[MODIFY] Account: ', error);
    }
  }

  async savePermissions(): Promise<any> {
    const form = this.forms.accountPermissions;
    const data = form.getRawValue();
    const body = { accessLevel: data.accessLevel, permissions: [] };

    if (form.invalid) {
      this.error = 'Form is invalid';
    }

    Object.keys(data.permissions).map(permission => {
      if (data.permissions[permission]) {
        body.permissions.push(permission);
      }
    });

    try {
      const account = await this.accountsService.modifyAccount(this.account.address, body);
      console.log('[MODIFY] Account ', account);
      this.getAccount();
    } catch (error) {
      console.error('[MODIFY] Account: ', error);
    }
  }
}
