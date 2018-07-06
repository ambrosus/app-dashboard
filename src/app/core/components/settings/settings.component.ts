import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PasswordService } from './../../../services/password.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [PasswordService]
})
export class SettingsComponent implements OnInit {

  private value: string;
  public width = 1;
  public colors: any = [
    '#D9534F', '#DF6A4F', '#E5804F', '#EA974E', '#F0AD4E', '#D2AF51',
    '#B5B154', '#97B456', '#7AB659', '#5CB85C', '#5CB85C'];
  public color = '#D9534F';
  public passwordExists: Boolean = false;
  weakPassword = false;
  spinner = false;
  error = false;
  resetForm: FormGroup;
  passwordsNotMatch = false;
  serverMessage = false;
  resetSuccess: Boolean = false;
  showWeakPasswordError: Boolean = false;
  blankField: Boolean = false;

  ngOnInit() {
  }

  strongPassword(control: FormControl): { [s: string]: boolean } {
    const hasNumber = /\d/.test(control.value);
    const hasUpper = /[A-Z]/.test(control.value);
    const hasLower = /[a-z]/.test(control.value);
    const valid = hasNumber && hasUpper && hasLower;
    if (!valid && control.value && control.value.length < 5) {
      return { strong: true };
    }
    return null;
  }

  constructor(
    private http: HttpClient,
    private passwordService: PasswordService
  ) {
    this.resetForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      oldPassword: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [this.strongPassword]),
      passwordConfirm: new FormControl(null, [Validators.required]),
    });
  }

  resetErrors() {
    this.resetSuccess = false;
    this.passwordsNotMatch = false;
    this.serverMessage = false;
    this.showWeakPasswordError = false;
    this.blankField = false;
  }

  initiateReset() {
    const email = this.resetForm.get('email').value;
    const password = this.resetForm.get('password').value;
    const oldPassword = this.resetForm.get('oldPassword').value;
    const passwordConfirm = this.resetForm.get('passwordConfirm').value;
    this.resetErrors();

    if (email === null || password === null || oldPassword === null || passwordConfirm === null) {
      this.blankField = true;
      console.log('');
      return;
    }

    this.spinner = true;

    this.http.post('/api/auth/verifymail', {email: email}).subscribe(
      resp => {

        if (this.resetForm.get('password').hasError('strong')) {
          this.weakPassword = true;
          this.showWeakPasswordError = true;
          this.error = true;
          this.spinner = false;
          return;
        }

        if (password !== passwordConfirm) {
          this.passwordsNotMatch = true;
          this.error = true;
          this.spinner = false;
          return;
        }

        this.weakPassword = false;
        this.passwordsNotMatch = false;
        this.error = false;

        const body = {
          email: email,
          oldPassword: oldPassword,
          password: password
        };

        this.resetPass(body);

      },
      err => {
        console.log(err);
        this.serverMessage = err.error.message;
        this.spinner = false;
      }
    );
  }

  resetPass(body) {
    this.http.post('/api/auth/resetpassword', body).subscribe(
      resp => {
        console.log(resp);
        this.resetSuccess = true;
        this.spinner = false;
      }, err => {
        this.serverMessage = err.error.message;
        this.spinner = false;
    });
  }

  checkPassword(event: any) {
    this.value = event.target.value;
    if (this.value.length >= 1) {
      this.passwordExists = true;
    } else {
      this.passwordExists = false;
    }
    this.width = this.passwordService.strengthCalculator(this.value);
    this.updateBar();
  }

  updateBar() {
    const i = Math.round(this.width / 10);
    this.color = this.colors[i];
  }

}
