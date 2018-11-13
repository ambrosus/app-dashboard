import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { OrganizationsService } from 'app/services/organizations.service';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  subs: Subscription[] = [];
  error;
  success;
  account;
  organization;
  accountAdmins = [];

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
    private accountsService: AccountsService,
  ) {}

  ngOnInit() {
    this.account = this.storageService.get('account');
    this.initSettingsForm();
    this.getOrganization();
    this.subs[this.subs.length] = this.accountsService._account.subscribe(
      account => (this.account = account),
    );
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  getOrganization() {
    this.organizationsService
      .getOrganization(this.account.organization)
      .then((organization: any) => {
        console.log('[GET] Organization: ', organization);
        this.organization = organization;
        const form = this.settingsForm;
        form.get('title').setValue(organization.title);
        form.get('legalAddress').setValue(organization.legalAddress);
      })
      .catch(err => console.error('[GET] Organization: ', err));
  }

  initSettingsForm() {
    this.settingsForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      legalAddress: new FormControl('', [Validators.required]),
    });
  }

  editOrganization() {
    this.error = null;
    this.success = null;
    const form = this.settingsForm;
    const data = form.getRawValue();

    if (form.invalid) {
      return (this.error = 'Please fill all required fields');
    }

    this.organizationsService
      .modifyOrganization(this.account.organization, data)
      .then(organization => {
        console.log('[MODIFY] Organization: ', organization);
        this.success = 'Success';
        this.organization = organization;
        this.accountsService.getAccount(this.account.address).then();
      })
      .catch(err => {
        console.error('[MODIFY] Organization: ', err);
        this.error = 'Update failed';
      });
  }
}
