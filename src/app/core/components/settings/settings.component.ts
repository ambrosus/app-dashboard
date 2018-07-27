import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PasswordService } from 'app/services/password.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [PasswordService],
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent implements OnInit {
  private value: string;
  width = 1;
  colors: any = [
    '#D9534F', '#DF6A4F', '#E5804F', '#EA974E', '#F0AD4E', '#D2AF51',
    '#B5B154', '#97B456', '#7AB659', '#5CB85C', '#5CB85C'];
  color = '#D9534F';
  passwordExists: Boolean = false;
  spinner = false;
  error;
  resetForm: FormGroup;
  resetSuccess: Boolean = false;
  strengthObj: any;
  flags = [];
  has_account = false;
  accounts: any;
  currentAccount;
  addAccount;

  ngOnInit() {
    this.settingsInit();
  }

  settingsInit() {
    this.has_account = JSON.parse(this.storage.get('has_account'));
    const accounts = this.storage.get('accounts');
    this.accounts = accounts ? JSON.parse(accounts) : [];
    this.currentAccount = this.accounts[0];
  }

  constructor(
    private http: HttpClient,
    private passwordService: PasswordService,
    private storage: StorageService,
    private auth: AuthService
  ) {
    this.resetForm = new FormGroup({
      oldPassword: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      passwordConfirm: new FormControl(null, [Validators.required]),
    });
  }

  resetErrors() {
    this.error = false;
    this.resetSuccess = false;
  }

  resetPassword() {
    this.resetErrors();
    const email = this.storage.get('email');
    const password = this.resetForm.get('password').value;
    const oldPassword = this.resetForm.get('oldPassword').value;
    const passwordConfirm = this.resetForm.get('passwordConfirm').value;

    if (!email || !password || !oldPassword || !passwordConfirm) {
      this.error = 'All fields are required';
      return;
    }

    let flagCounter = 0;
    this.flags.forEach(v => v ? flagCounter++ : v);

    if (flagCounter <= 2) {
      this.error = 'Weak password';
      this.spinner = false;
      return;
    }

    if (password !== passwordConfirm) {
      this.error = 'Passwords do not match';
      this.spinner = false;
      return;
    }

    this.spinner = true;

    const body = {
      email,
      oldPassword,
      password
    };

    this.http.post('/api/auth/resetpassword', body).subscribe(
      resp => {
        this.spinner = false;
        this.resetSuccess = true;
      },
      err => {
        this.spinner = false;
        this.error = err.error.message;
        console.log('Signup failed: ', err);
      }
    );
  }

  checkPassword(event: any) {
    this.value = event.target.value;
    if (this.value.length >= 1) {
      this.passwordExists = true;
    } else {
      this.passwordExists = false;
    }
    this.strengthObj = this.passwordService.strengthCalculator(this.value);
    this.width = this.strengthObj.width;
    this.flags = this.strengthObj.flags;
    this.updateBar();
  }

  updateBar() {
    const i = Math.round(this.width / 10);
    this.color = i > this.colors.length - 1 ? this.colors[this.colors.length - 1] : this.colors[i];
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
