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
  selectAllText = 'Select all';
  getUsersSub: Subscription;
  getInvitesSub: Subscription;
  users = [];
  invites = [];
  ids = [];
  user;
  showUsers = true;

  constructor(
    private invitesService: InviteService,
    private storageService: StorageService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.user = this.storageService.get('user') || {};
    this.getUsers();
    this.getInvites();
  }

  ngOnDestroy() {
    if (this.getUsersSub) { this.getUsersSub.unsubscribe(); }
    if (this.getInvitesSub) { this.getInvitesSub.unsubscribe(); }
  }

  getUsers() {
    this.getUsersSub = this.usersService.getUsers().subscribe(
      (users: any) => {
        this.users = users.map(user => {
          user.lastLogin = moment.tz(user.lastLogin, this.user.organization.timeZone).fromNow();
          return user;
        });
        console.log('Users GET: ', this.users);
      },
      err => console.error('Users GET error: ', err)
    );
  }

  getInvites() {
    this.getInvitesSub = this.invitesService.getInvites(this.user).subscribe(
      (invites: any) => {
        this.invites = invites.map(invite => {
          invite.createdAt = moment.tz(invite.createdAt, this.user.organization.timeZone).fromNow();
          return invite;
        });
        console.log('Invites GET: ', this.invites);
      },
      err => console.error('Invites GET error: ', err)
    );
  }
}
