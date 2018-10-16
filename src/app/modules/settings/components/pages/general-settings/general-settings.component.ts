import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { UsersService } from 'app/services/users.service';
import { Subscription } from 'rxjs';

declare let Web3: any;

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss'],
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {
  updateProfileForm: FormGroup;
  updateProfileSub: Subscription;
  getAccountSub: Subscription;
  error;
  success;
  spinner = false;
  user;
  timezones = [];
  web3;

  constructor(
    private storageService: StorageService,
    private usersService: UsersService
  ) {
    this.web3 = new Web3();
  }

  ngOnInit() {
    this.user = this.storageService.get('user') || {};

    this.updateProfileForm = new FormGroup({
      full_name: new FormControl(this.user.full_name, []),
      email: new FormControl(this.user.email, [Validators.required]),
      timeZone: new FormControl(this.user.timeZone, [Validators.required]),
      password: new FormControl('', []),
      passwordConfirm: new FormControl('', [this.comparePasswords]),
    });

    this.timezones = moment.tz.names();
  }

  comparePasswords(fieldControl: FormControl) {
    try {
      return fieldControl.value === this.updateProfileForm.value.password ? null : { NotEqual: true };
    } catch (e) { return null; }
  }

  ngOnDestroy() {
    if (this.updateProfileSub) { this.updateProfileSub.unsubscribe(); }
    if (this.getAccountSub) { this.getAccountSub.unsubscribe(); }
  }

  emit(type) { window.dispatchEvent(new Event(type)); }

  updateProfile() {
    this.error = false;
    this.success = false;
    const secret = this.storageService.get('secret');
    const data = this.updateProfileForm.value;

    if (data.password && (data.password !== data.passwordConfirm)) { return this.error = 'Password and password confirm do not match'; }

    const body = {
      full_name: data.full_name,
      email: data.email,
      timeZone: data.timeZone,
    };

    if (data.password) {
      body['password'] = data.password;
      body['token'] = JSON.stringify(this.web3.eth.accounts.encrypt(secret, data.password));
    }

    if (this.updateProfileForm.valid) {
      this.spinner = true;

      this.updateProfileSub = this.usersService.updateProfile(body).subscribe(
        resp => {
          this.spinner = false;
          this.success = 'Update successful!';
          this.getAccountSub = this.usersService.getUser(this.user.email).subscribe(
            user => {
              this.storageService.set('user', user);
              this.emit('user:refresh');
            },
            err => console.error('Account GET error: ', err)
          );
        },
        err => {
          this.spinner = false;
          this.error = err.message;
          console.error('Profile UPDATE error: ', err);
        }
      );
    } else {
      this.error = 'All inputs are required';
    }
  }
}
