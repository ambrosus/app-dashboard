import { LoginComponent } from './../login/login.component';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PasswordService } from 'app/services/password.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  passwordExists: Boolean = false;
  spinner = false;
  error;
  resetForm: FormGroup;
  resetSuccess: Boolean = false;
  flags = [];
  has_account = false;
  user;
  @ViewChild('flags') passwordValidator;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  ngOnInit() {
    this.settingsInit();
    window.addEventListener('user:login', () => {
      this.settingsInit();
    });
  }

  settingsInit() {
    this.user = this.storage.get('user');
    this.has_account = this.user.hasOwnProperty('full_name');

    console.log(this.user);
  }

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private auth: AuthService,
    private users: UsersService
  ) {
    this.resetForm = new FormGroup({
      oldPassword: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      passwordConfirm: new FormControl(null, [Validators.required]),
    });
  }

  saveSettings(json) {
    console.log(json);

    this.users.update(this.user.email, json).subscribe(msg => {
      console.log(msg);
    });

  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(image: string) {
    this.croppedImage = image;
  }

  saveAvatar() {

  }

  resetErrors() {
    this.error = false;
    this.resetSuccess = false;
  }

  changePassword() {
    this.resetErrors();
    const email = this.storage.get('user')['email'];
    const newPassword = this.resetForm.get('password').value;
    const oldPassword = this.resetForm.get('oldPassword').value;
    const passwordConfirm = this.resetForm.get('passwordConfirm').value;

    if (!email || !newPassword || !oldPassword || !passwordConfirm) {
      this.error = 'All fields are required';
      return;
    }

    this.flags = this.passwordValidator.getFlags();
    let flagCounter = 0;
    this.flags.forEach(v => v ? flagCounter++ : v);

    if (flagCounter <= 2) {
      this.error = 'Weak password';
      this.spinner = false;
      return;
    }

    if (newPassword !== passwordConfirm) {
      this.error = 'Passwords do not match';
      this.spinner = false;
      return;
    }

    this.spinner = true;

    const body = {
      email,
      oldPassword,
      newPassword
    };

    this.http.put('/api/users/password', body).subscribe(
      resp => {
        this.spinner = false;
        this.resetSuccess = true;
      },
      err => {
        this.spinner = false;
        this.error = err.error.message;
        console.log('Reset password error: ', err);
      }
    );
  }

  switchAccount(address) {
    this.auth.switchAccount(address);
  }

  logout() {
    this.auth.logout();
  }

  logoutAll() {
    this.auth.logoutAll();
  }
}
