import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from 'app/services/accounts.service';
import { InviteService } from 'app/services/invite.service';

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
  accounts = [];
  accountsDisabled = [];
  invites = [];
  ids = [];
  account;
  show = 'active';
  success;
  error;

  constructor(
    private invitesService: InviteService,
    private storageService: StorageService,
    private accountsService: AccountsService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.getAccounts();
    this.getInvites();
  }

  ngOnDestroy() {
    if (this.getAccountsSub) { this.getAccountsSub.unsubscribe(); }
    if (this.getInvitesSub) { this.getInvitesSub.unsubscribe(); }
    if (this.invitesAction) { this.invitesAction.unsubscribe(); }
    if (this.accountsAction) { this.accountsAction.unsubscribe(); }
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

  getAccounts() {
    this.getAccountsSub = this.accountsService.getAccounts().subscribe(
      (accounts: any) => {
        this.accounts = accounts.filter(account => {
          account.lastLogin = moment.tz(account.lastLogin, this.account.organization.timeZone).fromNow();
          return account.active;
        });
        this.accountsDisabled = accounts.filter(account => {
          return !account.active;
        });
        console.log('Accounts GET: ', this.accounts);
      },
      err => console.error('Accounts GET error: ', err),
    );
  }

  getInvites() {
    this.getInvitesSub = this.invitesService.getInvites().subscribe(
      (invites: any) => {
        this.invites = invites.map(invite => {
          invite.createdAt = moment.tz(invite.createdAt, this.account.organization.timeZone).fromNow();
          return invite;
        });
        console.log('Invites GET: ', this.invites);
      },
      err => console.error('Invites GET error: ', err),
    );
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
