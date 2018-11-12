import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from 'app/services/accounts.service';
import { InviteService } from 'app/services/invite.service';
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
    private invitesService: InviteService,
    private storageService: StorageService,
    private accountsService: AccountsService,
    private organizationsService: OrganizationsService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.getOrganization();
    this.getAccounts();
    this.getInvites();
  }

  ngOnDestroy() {
    if (this.getAccountsSub) { this.getAccountsSub.unsubscribe(); }
    if (this.getInvitesSub) { this.getInvitesSub.unsubscribe(); }
    if (this.invitesAction) { this.invitesAction.unsubscribe(); }
    if (this.accountsAction) { this.accountsAction.unsubscribe(); }
    if (this.getOrganizationSub) { this.getOrganizationSub.unsubscribe(); }
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
    this.getOrganizationSub = this.organizationsService.getOrganization(this.account.organization).subscribe(
      (organization: any) => {
        console.log('[GET] Organization: ', organization);
        this.organization = organization;
      },
      err => console.error('[GET] Organization: ', err),
    );
  }

  getAccounts() {
    this.getAccountsSub = this.organizationsService.getOrganizationAccounts(this.account.organization).subscribe(
      (accounts: any[]) => {
        console.log('[GET] Accounts: ', accounts);
        this.accounts = accounts.filter(account => account.permissions.length);
        this.accountsDisabled = accounts.filter(account => !account.permissions.length);
      },
      err => console.error('[GET] Accounts: ', err),
    );
  }

  getInvites() {
    // this.getInvitesSub = this.invitesService.getInvites().subscribe(
    //   (invites: any) => {
    //     this.invites = invites.map(invite => {
    //       invite.createdAt = moment.tz(invite.createdAt, this.account.organization.timeZone).fromNow();
    //       return invite;
    //     });
    //     console.log('Invites GET: ', this.invites);
    //   },
    //   err => console.error('Invites GET error: ', err),
    // );
  }

  actions(action, body = {}) {
    switch (action) {
      case 'inviteRevoke':
        this.invitesAction = this.invitesService.revokeInvites(body['ids']).subscribe(
          resp => this.getInvites(),
          err => this.error = err.message,
        );
        break;
      case 'accountEdit':
        this.accountsAction = this.accountsService.modifyAccount(body['address'], body['data']).subscribe(
          resp => this.getAccounts(),
          err => this.error = err.message,
        );
        break;
    }
  }
}
