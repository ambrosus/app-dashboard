import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { AccountsService } from 'app/services/accounts.service';
import { OrganizationsService } from 'app/services/organizations.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { InviteComponent } from '../invite/invite.component';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AllComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  accounts = [];
  accountsDisabled = [];
  invites = [];
  ids = [];
  account;
  show = 'all';
  organization;
  self = this;
  dialogRef;

  constructor(
    private storageService: StorageService,
    private accountsService: AccountsService,
    private organizationsService: OrganizationsService,
    public dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit() {
    this.subs[this.subs.length] = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
    this.account = this.storageService.get('account') || {};
    this.actions = this.actions.bind(this);
    this.getOrganization().then();
    this.getAccounts().then();
    this.getInvites().then();
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
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
      const accounts = await this.organizationsService.getOrganizationAccounts(this.account.organization);
      this.accounts = accounts.filter(account => account.permissions.length);
      this.accountsDisabled = accounts.filter(account => !account.permissions.length);
      console.log('[GET] Organization accounts: ', this.accounts);
      console.log('[GET] Organization accounts disabled: ', this.accountsDisabled);
    } catch (error) {
      console.error('[GET] Accounts: ', error);
    }
  }

  async getInvites(next = ''): Promise<any> {
    try {
      const invites = await this.organizationsService.getInvites(next);
      this.invites = invites.map(invite => {
        invite.createdOn = moment.tz(invite.createdOn * 1000, this.account.timeZone || 'UTC').fromNow();
        return invite;
      });
      console.log('[GET] Invites: ', this.invites);
    } catch (error) {
      console.error('[GET] Invites: ', error);
    }
  }

  async actions(...args): Promise<any> {
    switch (args[0]) {
      case 'inviteDelete':
        try {
          await this.organizationsService.deleteInvite(args[1].inviteId);
          await this.getInvites();
        } catch (error) {
          console.error('[DELETE] Invite: ', error);
        }
        break;

      case 'inviteResend':
        try {
          await this.organizationsService.resendInvites(args[1]);
          await this.getInvites();
        } catch (error) {
          console.error('[RESEND] Invite: ', error);
        }
        break;

      case 'accountModify':
        try {
          await this.accountsService.modifyAccount(args[1]['address'], args[1]['data']);
          await this.getAccounts();
        } catch (error) {
          console.error('[MODIFY] Account: ', error);
        }
        break;
    }
  }

  openInviteDialog() {
    this.dialogRef = this.dialog.open(InviteComponent, {
      panelClass: 'dialog',
    });

    this.dialogRef
      .afterClosed()
      .subscribe(result => {
        console.log('Invite dialog was closed');
        this.getInvites().then();
      });
  }
}
