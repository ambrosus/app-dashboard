import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { HttpClient } from '@angular/common/http';
import { PasswordService } from 'app/services/password.service';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [PasswordService],
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent {
  signupForm: FormGroup;
  error;
  spinner = false;
  passwordExists: Boolean = false;
  private value: string;
  public width = 1;
  public colors: any = [
    '#D9534F', '#DF6A4F', '#E5804F', '#EA974E', '#F0AD4E', '#D2AF51',
    '#B5B154', '#97B456', '#7AB659', '#5CB85C', '#5CB85C'];
  public color = '#D9534F';
  strengthObj: any;
  flags = [];

  constructor(
    private storage: StorageService,
    private http: HttpClient,
    private passwordService: PasswordService,
    private auth: AuthService,
    private router: Router
  ) {
    this.signupForm = new FormGroup({
      address: new FormControl(this.storage.get('address'), [Validators.required]),
      secret: new FormControl(this.storage.get('secret'), [Validators.required]),
      fullname: new FormControl(null, [Validators.required]),
      company: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
      passwordConfirm: new FormControl(null, [Validators.required]),
      terms: new FormControl(null, [Validators.required])
    });
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

  resetErrors() {
    this.error = false;
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
    this.resetErrors();

    let flagCounter = 0;
    this.flags.forEach(v => v ? flagCounter++ : v);

    if (this.signupForm.invalid || !terms) {
      this.error = 'All fields are required';
      return;
    }

    if (flagCounter <= 2) {
      this.error = 'Weak password';
      return;
    }

    if (password !== passwordConfirm) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.signupForm.valid && terms) {
      this.spinner = true;

      const body = {
        address,
        secret,
        full_name,
        company,
        email,
        password
      };

      const url = `/api/auth/signup`;

      this.http.post(url, body).subscribe(
        resp => {
          this.spinner = false;

          this.auth.login(address, secret).subscribe(
            r => {
              this.router.navigate(['/assets']);
            }
          );
        },
        err => {
          this.spinner = false;
          this.error = JSON.stringify(err.message ? err.message : err);

          console.log('Signup failed: ', err);
        }
      );
    }
  }
}
