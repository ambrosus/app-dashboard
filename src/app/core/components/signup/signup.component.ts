import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
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
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  error;
  spinner = false;
  passwordExists: Boolean = false;
  flags = [];
  @ViewChild('flags') passwordValidator;

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
      title: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
      passwordConfirm: new FormControl(null, [Validators.required]),
      terms: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {
    const url = `/api/hermeses`;

    this.http.get(url).subscribe(
      (resp: any) => {
        if (resp.resultCount === 0) {
          this.router.navigate(['/hermes']);
        } else {
          this.storage.set('hermes', resp.data[0]);
        }
      },
      err => {
        console.log('Hermes GET error: ', err);
      }
    );
  }

  resetErrors() {
    this.error = false;
  }

  signup() {
    const address = this.signupForm.get('address').value;
    const secret = this.signupForm.get('secret').value;
    const full_name = this.signupForm.get('fullname').value;
    const title = this.signupForm.get('title').value;
    const email = this.signupForm.get('email').value;
    const password = this.signupForm.get('password').value;
    const passwordConfirm = this.signupForm.get('passwordConfirm').value;
    const terms = this.signupForm.get('terms').value;
    const hermes = this.storage.get('hermes');
    this.resetErrors();

    this.flags = this.passwordValidator.getFlags();
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
        hermes,
        title,
        email,
        password
      };

      const url = `/api/companies`;

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
          this.error = err.error.message ? err.error.message : 'Company creation error';

          console.log('Company creation failed: ', err);
        }
      );
    }
  }
}
