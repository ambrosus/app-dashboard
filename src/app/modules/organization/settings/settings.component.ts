import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { OrganizationsService } from 'app/services/organizations.service';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  editOrganizationSub: Subscription;
  accountGetSub: Subscription;
  getAccountsSub: Subscription;
  error;
  success;
  account;
  organization;
  accountAdmins = [];

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
    private accountsService: AccountsService,
  ) { }

  ngOnInit() {
    this.initSettingsForm();
    this.accountGetSub = this.accountsService._account.subscribe(account => this.account = account);
    this.getAccounts();
  }

  ngOnDestroy() {
    if (this.editOrganizationSub) { this.editOrganizationSub.unsubscribe(); }
    if (this.accountGetSub) { this.accountGetSub.unsubscribe(); }
    if (this.getAccountsSub) { this.getAccountsSub.unsubscribe(); }
  }

  getAccounts() {
    this.getAccountsSub = this.accountsService.getAccounts().subscribe(
      (accounts: any) => {
        this.accountAdmins = accounts.filter(account => {
          account.lastLogin = moment.tz(account.lastLogin, this.account.organization.timeZone).fromNow();
          return account.permissions.indexOf('manage_organization') > -1;
        });
        console.log('[GET] Accounts: ', this.accountAdmins);
      },
      err => console.error('[GET] Accounts: ', err),
    );
  }

  initSettingsForm() {
    this.account = this.storageService.get('account') || {};
    this.organization = this.account['organization'] || {};

    this.settingsForm = new FormGroup({
      title: new FormControl(this.organization.title, [Validators.required]),
      legalAddress: new FormControl(this.organization.legalAddress, [Validators.required]),
    });
  }

  editOrganization() {
    this.error = null;
    this.success = null;
    const data = this.settingsForm.value;

    if (this.settingsForm.valid) {
      this.editOrganizationSub = this.organizationsService.editOrganization(data, this.account.organization._id).subscribe(
        (resp: any) => {
          this.success = 'Update success';
          this.organization = resp;
          this.accountsService.getAccount(this.account.email).subscribe();
          console.log('Organization UPDATE: ', resp);
        },
        err => {
          this.error = err.message;
          console.error('Organization UPDATE: ', err);
        },
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
