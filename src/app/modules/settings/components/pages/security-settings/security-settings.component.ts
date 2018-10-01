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

@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss'],
})
export class SecuritySettingsComponent implements OnInit, OnDestroy {
  sessions;
  spinner: Boolean = false;
  resetForm: FormGroup;
  resetSuccess: Boolean = false;
  error;
  getSessionsSub: Subscription;
  logoutSessionSub: Subscription;
  logoutDevicesSub: Subscription;

  constructor(private http: HttpClient, private storageService: StorageService, private authService: AuthService) {
    this.resetForm = new FormGroup({
      oldPassword: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      passwordConfirm: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit() {
    this.getSessions();
  }

  getSessions() {
    const email = this.storageService.get('user')['email'];
    const url = `/api/auth/sessions`;

    this.getSessionsSub = this.http.get(url).subscribe(
      resp => {
        console.log('GET sessions: ', resp);
        this.sessions = resp;
      },
      err => {
        if (err.status === 401) { this.authService.logout(); }
        console.log('GET sessions error: ', err);
      }
    );
  }

  logoutSession(sessionId) {
    const url = `/api/auth/session/${sessionId}`;

    this.logoutSessionSub = this.http.delete(url).subscribe(
      resp => this.getSessions(),
      err => {
        if (err.status === 401) { this.authService.logout(); }
        console.log('DELETE session error: ', err);
      }
    );
  }

  ngOnDestroy() {
    if (this.getSessionsSub) { this.getSessionsSub.unsubscribe(); }
    if (this.logoutSessionSub) { this.logoutSessionSub.unsubscribe(); }
    if (this.logoutDevicesSub) { this.logoutDevicesSub.unsubscribe(); }
  }

  changePassword() {
    this.resetErrors();
    const data = this.resetForm.value;
    const email = this.storageService.get('user')['email'];

    if (!email || !this.resetForm.valid) { return this.error = 'All fields are required'; }

    this.spinner = true;

    const url = `/api/users/password`;

    this.http.put(url, data).subscribe(
      resp => {
        this.spinner = false;
        this.resetSuccess = true;
      },
      err => {
        if (err.status === 401) { this.authService.logout(); }
        this.spinner = false;
        this.error = err.message;
        console.log('Reset password error: ', err);
      }
    );
  }

  resetErrors() {
    this.error = false;
    this.resetSuccess = false;
  }

  logoutOfAllDevices() {
    const url = `/api/auth/sessions/`;
    this.logoutDevicesSub = this.http.delete(url).subscribe(
      resp => this.getSessions(),
      err => console.log('DELETE session error: ', err)
    );
  }
}
