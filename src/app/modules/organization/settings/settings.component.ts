import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { OrganizationsService } from 'app/services/organizations.service';
import { UsersService } from 'app/services/users.service';
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
  userGetSub: Subscription;
  getUsersSub: Subscription;
  error;
  success;
  user;
  organization;
  userAdmins = [];

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.initSettingsForm();
    this.userGetSub = this.usersService._user.subscribe(user => this.user = user);
    this.getUsers();
  }

  ngOnDestroy() {
    if (this.editOrganizationSub) { this.editOrganizationSub.unsubscribe(); }
    if (this.userGetSub) { this.userGetSub.unsubscribe(); }
    if (this.getUsersSub) { this.getUsersSub.unsubscribe(); }
  }

  getUsers() {
    this.getUsersSub = this.usersService.getUsers().subscribe(
      (users: any) => {
        this.userAdmins = users.filter(user => {
          user.lastLogin = moment.tz(user.lastLogin, this.user.organization.timeZone).fromNow();
          return user.permissions.indexOf('manage_organization') > -1;
        });
        console.log('User Admins GET: ', this.userAdmins);
      },
      err => console.error('Users GET error: ', err),
    );
  }

  initSettingsForm() {
    this.user = this.storageService.get('user') || {};
    this.organization = this.user['organization'] || {};

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
      this.editOrganizationSub = this.organizationsService.editOrganization(data, this.user.organization._id).subscribe(
        (resp: any) => {
          this.success = 'Update success';
          this.organization = resp;
          this.usersService.getUser(this.user.email).subscribe();
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
