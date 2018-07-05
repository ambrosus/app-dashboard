import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';
import { HttpClient } from '@angular/common/http';
import { PasswordService } from '../../../services/password.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [PasswordService]
})
export class SignupComponent implements OnInit {
  // Sign up form
  signupForm: FormGroup;
  error = false;
  spinner = false;
  weakPassword = false;
  passwordsNotMatch = false;
  passwordExists: Boolean = false;
  signupError = false;
  signupSuccess = false;
  private value: string;
  public width = 1;
  public colors: any = [
    '#D9534F', '#DF6A4F', '#E5804F', '#EA974E', '#F0AD4E', '#D2AF51',
    '#B5B154', '#97B456', '#7AB659', '#5CB85C', '#5CB85C'];
  public color = '#D9534F';

  // Custom validator for strong password
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
    private auth: AuthService,
    private router: Router,
    private storage: StorageService,
    private http: HttpClient,
    private passwordService: PasswordService
  ) {
    this.signupForm = new FormGroup({
      address: new FormControl(null, [Validators.required]),
      secret: new FormControl(null, [Validators.required]),
      fullname: new FormControl(null, [Validators.required]),
      company: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [this.strongPassword]),
      passwordConfirm: new FormControl(null, [Validators.required]),
      terms: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {}

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

  signup() {
    const address = this.signupForm.get('address').value;
    const secret = this.signupForm.get('secret').value;
    const full_name = this.signupForm.get('fullname').value;
    const company = this.signupForm.get('company').value;
    const email = this.signupForm.get('email').value;
    const password = this.signupForm.get('password').value;
    const passwordConfirm = this.signupForm.get('passwordConfirm').value;
    const terms = this.signupForm.get('terms').value;

    if (this.signupForm.get('password').hasError('strong')) {
      this.weakPassword = true;
      this.error = true;
      return;
    }

    if (password !== passwordConfirm) {
      this.passwordsNotMatch = true;
      this.error = true;
      return;
    }

    if (this.signupForm.valid && terms) {
      this.spinner = true;
      this.error = false;
      this.weakPassword = false;
      this.passwordsNotMatch = false;

      const body = {
        address: address,
        secret: secret,
        full_name: full_name,
        company: company,
        email: email,
        password: password
      };

      const url = `/api/auth/signup`;

      this.http.post(url, body).subscribe(
        resp => {
          this.signupSuccess = true;
          this.spinner = false;
          this.signupForm.reset();

          console.log('resp ', resp);
        },
        err => {
          this.error = true;
          this.signupError = true;
          this.spinner = false;

          console.log('err ', err);
        }
      );
    } else {
      this.error = true;
    }
  }
}
