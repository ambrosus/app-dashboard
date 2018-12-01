import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit, OnDestroy {
  forms: {
    settings?: FormGroup,
  } = {};
  subs: Subscription[] = [];
  account: any = {};
  organization: any = {};
  accountAdmins = [];
  timezones = [];
  promise: any = {};

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
    private accountsService: AccountsService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account');
    this.forms.settings = new FormGroup({
      owner: new FormControl({ value: '', disabled: true }),
      title: new FormControl('', [Validators.required]),
      timeZone: new FormControl(''),
      legalAddress: new FormControl(''),
    });
    this.getOrganization().then();

    this.subs[this.subs.length] = this.accountsService._account.subscribe(account => this.account = account);

    this.timezones = moment.tz.names();
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  async getOrganization(): Promise<any> {
    try {
      this.organization = await this.organizationsService.getOrganization(this.account.organization);
      console.log('[GET] Organization: ', this.organization);

      const form = this.forms.settings;
      form.get('owner').setValue(this.organization.owner);
      form.get('title').setValue(this.organization.title);
      form.get('timeZone').setValue(this.organization.timeZone);
      form.get('legalAddress').setValue(this.organization.legalAddress);
    } catch (error) {
      console.error('[GET] Organization: ', error);
    }
  }

  save() {
    this.promise['save'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.settings;
        const data = form.value;

        if (form.invalid) {
          throw new Error('Please fill all required fields');
        }

        this.organization = await this.organizationsService.modifyOrganization(this.account.organization, data);
        await this.accountsService.getAccount(this.account.address);

        resolve();
      } catch (error) {
        console.error('[MODIFY] Organization: ', error);
        reject();
      }
    });
  }
}
