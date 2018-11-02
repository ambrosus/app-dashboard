import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { UsersService } from 'app/services/users.service';
import { InviteService } from 'app/services/invite.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss'],
})
export class AllComponent implements OnInit, OnDestroy {
  getUsersSub: Subscription;
  getInvitesSub: Subscription;
  invitesAction: Subscription;
  usersAction: Subscription;
  users = [];
  usersDisabled = [];
  invites = [];
  ids = [];
  user;
  show = 'active';
  success;
  error;

  constructor(
    private invitesService: InviteService,
    private storageService: StorageService,
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.user = this.storageService.get('user') || {};
    this.getUsers();
    this.getInvites();
  }

  ngOnDestroy() {
    if (this.getUsersSub) { this.getUsersSub.unsubscribe(); }
    if (this.getInvitesSub) { this.getInvitesSub.unsubscribe(); }
    if (this.invitesAction) { this.invitesAction.unsubscribe(); }
    if (this.usersAction) { this.usersAction.unsubscribe(); }
  }

  getNumberOfAccounts() {
    switch (this.show) {
      case 'active':
        return this.users.length;
      case 'pending':
        return this.invites.length;
      case 'disabled':
        return this.usersDisabled.length;
    }
  }

  getUsers() {
    this.getUsersSub = this.usersService.getUsers().subscribe(
      (users: any) => {
        this.users = users.filter(user => {
          user.lastLogin = moment.tz(user.lastLogin, this.user.organization.timeZone).fromNow();
          return user.active;
        });
        this.usersDisabled = users.filter(user => {
          return !user.active;
        });
        console.log('Users GET: ', this.users);
      },
      err => console.error('Users GET error: ', err),
    );
  }

  getInvites() {
    this.getInvitesSub = this.invitesService.getInvites().subscribe(
      (invites: any) => {
        this.invites = invites.map(invite => {
          invite.createdAt = moment.tz(invite.createdAt, this.user.organization.timeZone).fromNow();
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
      case 'userEdit':
        this.usersAction = this.usersService.editUser(body['data'], body['email']).subscribe(
          resp => this.getUsers(),
          err => this.error = err.message,
        );
        break;
    }
  }
}
