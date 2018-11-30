import { Component, OnInit } from '@angular/core';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from 'app/services/accounts.service';
import { OrganizationsService } from 'app/services/organizations.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss'],
})
export class AllComponent implements OnInit {
  accounts = [];
  accountsDisabled = [];
  invites = [];
  ids = [];
  account;
  show = 'active';
  success;
  error;
  organization;

  constructor(
    private storageService: StorageService,
    private accountsService: AccountsService,
    private organizationsService: OrganizationsService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.getOrganization();
    this.getAccounts().then();
    this.getInvites().then();
  }

  getNumberOfAccounts() {
    switch (this.show) {
      case 'active':
        return this.accounts.length;
      case 'pending':
        return this.invites.length;
      case 'disabled':
        return this.accountsDisabled.length;
    }
  }

  async getOrganization(): Promise<any> {
    try {
      this.organization = await this.organizationsService.getOrganization(this.account.organization);
      console.log('[GET] Organization: ', this.organization);
    } catch (error) {
      console.error('[GET] Organization: ', error);
    }
  }

  async getAccounts(): Promise<any> {
    try {
      this.accounts = await this.organizationsService.getOrganizationAccounts(this.account.organization);
      console.log('[GET] Organization accounts: ', this.accounts);
      this.accounts = this.accounts.filter(account => account.permissions.length);
      this.accountsDisabled = this.accounts.filter(account => !account.permissions.length);
    } catch (error) {
      console.error('[GET] Accounts: ', error);
    }
  }

  async getInvites(next = ''): Promise<any> {
    try {
      this.invites = await this.organizationsService.getInvites(next);
      console.log('[GET] Invites: ', this.invites);
      this.invites = this.invites.map(invite => {
        invite.createdOn = moment.tz(invite.createdOn * 1000, this.account.timeZone || 'UTC').fromNow();
        return invite;
      });
    } catch (error) {
      console.error('[GET] Invites: ', error);
    }
  }

  async actions(action, body: any = {}): Promise<any> {
    switch (action) {
      case 'inviteDelete':
        try {
          await this.organizationsService.deleteInvite(body.inviteId);
          await this.getInvites();
        } catch (error) {
          console.error('[DELETE] Invite: ', error);
        }
        break;

      case 'accountEdit':
        try {
          await this.accountsService.modifyAccount(body['address'], body['data']);
          await this.getAccounts();
        } catch (error) {
          console.error('[MODIFY] Account: ', error);
        }
        break;
    }
  }
}
