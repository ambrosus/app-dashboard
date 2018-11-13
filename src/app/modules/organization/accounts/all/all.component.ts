import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from 'app/services/accounts.service';
import { OrganizationsService } from 'app/services/organizations.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss'],
})
export class AllComponent implements OnInit, OnDestroy {
  getAccountsSub: Subscription;
  getInvitesSub: Subscription;
  invitesAction: Subscription;
  accountsAction: Subscription;
  getOrganizationSub: Subscription;
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
  ) {}

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.getOrganization();
    this.getAccounts();
    this.getInvites();
  }

  ngOnDestroy() {
    if (this.getAccountsSub) {
      this.getAccountsSub.unsubscribe();
    }
    if (this.getInvitesSub) {
      this.getInvitesSub.unsubscribe();
    }
    if (this.invitesAction) {
      this.invitesAction.unsubscribe();
    }
    if (this.accountsAction) {
      this.accountsAction.unsubscribe();
    }
    if (this.getOrganizationSub) {
      this.getOrganizationSub.unsubscribe();
    }
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

  getOrganization() {
    this.getOrganizationSub = this.organizationsService
      .getOrganization(this.account.organization)
      .subscribe(
        (organization: any) => {
          console.log('[GET] Organization: ', organization);
          this.organization = organization;
        },
        err => console.error('[GET] Organization: ', err),
      );
  }

  getAccounts() {
    this.getAccountsSub = this.organizationsService
      .getOrganizationAccounts(this.account.organization)
      .subscribe(
        (accounts: any[]) => {
          console.log('[GET] Accounts: ', accounts);
          this.accounts = accounts.filter(
            account => account.permissions.length,
          );
          this.accountsDisabled = accounts.filter(
            account => !account.permissions.length,
          );
        },
        err => console.error('[GET] Accounts: ', err),
      );
  }

  getInvites(next = null) {
    this.organizationsService
      .getInvites(next)
      .then((invites: any) => {
        this.invites = invites.map(invite => {
          invite.createdOn = moment
            .tz(invite.createdOn * 1000, this.account.timeZone || 'UTC')
            .fromNow();
          return invite;
        });
        console.log('[GET] Invites: ', this.invites);
      })
      .catch(error => console.error('[GET] Invites: ', error));
  }

  actions(action, body: any = {}) {
    switch (action) {
      case 'inviteDelete':
        this.organizationsService
          .deleteInvite(body.inviteId)
          .then(inviteDeleted => this.getInvites())
          .catch(error => (this.error = 'Invite remove failed'));
        break;

      case 'accountEdit':
        this.accountsAction = this.accountsService
          .modifyAccount(body['address'], body['data'])
          .subscribe(
            resp => this.getAccounts(),
            err => (this.error = err.message),
          );
        break;
    }
  }
}
