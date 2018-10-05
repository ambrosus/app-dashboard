/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss'],
})
export class SecuritySettingsComponent implements OnInit, OnDestroy {
  getSessionsSub: Subscription;
  logoutSessionSub: Subscription;
  logoutDevicesSub: Subscription;
  changePasswordSub: Subscription;
  resetForm: FormGroup;
  spinner;
  success;
  error;
  sessions;

  constructor(private storageService: StorageService, private authService: AuthService, private usersService: UsersService) {
    this.resetForm = new FormGroup({
      oldPassword: new FormControl(null, [Validators.required]),
      newPassword: new FormControl(null, [Validators.required]),
      newPasswordConfirm: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.getSessions();
  }

  ngOnDestroy() {
    if (this.getSessionsSub) { this.getSessionsSub.unsubscribe(); }
    if (this.logoutSessionSub) { this.logoutSessionSub.unsubscribe(); }
    if (this.logoutDevicesSub) { this.logoutDevicesSub.unsubscribe(); }
    if (this.changePasswordSub) { this.changePasswordSub.unsubscribe(); }
  }

  changePassword() {
    this.error = null;
    this.success = null;
    const data = this.resetForm.value;
    const email = this.storageService.get('user')['email'];
    data['email'] = email;

    if (!email || !this.resetForm.valid) { return this.error = 'All fields are required'; }
    if (data.newPassword !== data.newPasswordConfirm) { return this.error = 'New password and confirm password do not match'; }

    this.spinner = true;

    this.changePasswordSub = this.usersService.changePassword(data).subscribe(
      resp => {
        this.spinner = false;
        this.success = 'Password updated';
        console.log('Password UPDATE success: ', resp);
      },
      err => {
        if (err.status === 401) { this.authService.logout(); }
        this.spinner = false;
        this.error = err.message;
        console.log('Password UPADTE error: ', err.message);
      }
    );
  }

  getSessions() {
    this.getSessionsSub = this.usersService.getSessions().subscribe(
      resp => {
        this.sessions = resp;
        console.log('Sessions GET success: ', resp);
      },
      err => {
        if (err.status === 401) { this.authService.logout(); }
        console.error('Sessions GET error: ', err.message);
      }
    );
  }

  logoutSession(sessionId) {
    this.logoutSessionSub = this.usersService.logoutSession(sessionId).subscribe(
      resp => this.getSessions(),
      err => {
        if (err.status === 401) { this.authService.logout(); }
        console.error('Session DELETE error: ', err.message);
      }
    );
  }

  logoutOfAllDevices() {
    this.logoutDevicesSub = this.usersService.logoutOfAllDevices().subscribe(
      resp => this.getSessions(),
      err => console.error('Sessions DELETE error: ', err.message)
    );
  }
}
