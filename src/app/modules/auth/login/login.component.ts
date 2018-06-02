import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "app/services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  // Login form
  loginForm: FormGroup;
  error = false;
  spinner = false;
  // Sign up form
  signupForm: FormGroup;
  serror = false;
  sspinner = false;
  weakPassword = false;

  login = true;

  // Custom validator for strong password
  strongPassword(control: FormControl): {[s: string]: boolean} {
    const hasNumber = /\d/.test(control.value);
    const hasUpper = /[A-Z]/.test(control.value);
    const hasLower = /[a-z]/.test(control.value);
    // console.log('Num, Upp, Low', hasNumber, hasUpper, hasLower);
    const valid = hasNumber && hasUpper && hasLower;
    if (!valid && control.value && control.value.length > 5) {
      // return what´s not valid
      return { strong: true };
    }
    return null;
  }

  constructor(private auth: AuthService,
              private router: Router) {
    this.loginForm = new FormGroup({
      'address': new FormControl(null, [Validators.required]),
      'secret': new FormControl(null, [Validators.required])
    });
    this.signupForm = new FormGroup({
      'fullname': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, [Validators.required, this.strongPassword]),
      'country': new FormControl(null, [Validators.required]),
      'company': new FormControl(null, []),
      'reason': new FormControl(null, []),
      'terms': new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() { }

  onSignup() {
    const f = this.signupForm.get('fullname').value;
    const e = this.signupForm.get('email').value;
    const p = this.signupForm.get('password').value;
    const cy = this.signupForm.get('country').value;
    const co = this.signupForm.get('company').value;
    const r = this.signupForm.get('reason').value;
    const t = this.signupForm.get('terms').value;

    if (this.signupForm.get('password').hasError('strong')) {
      this.weakPassword = true;
    } else {
      this.weakPassword = false;
    }

    if (!this.signupForm.valid || !t) {
      this.serror = true;
    } else {
      this.serror = false;
      this.weakPassword = false;
    }

    if (!this.serror) {
      // Do something with this info
      this.signupForm.reset();
      this.auth.cleanForm.next(true);
    }

  }

  onLogin() {
    const a = this.loginForm.get('address').value;
    const s = this.loginForm.get('secret').value;

    localStorage.setItem('address', a);

    if (!this.loginForm.valid) {
      this.error = true;
    } else {
      this.error = false;
    }

    if (!this.error) {
      this.spinner = true;
      // Get the token
      this.auth.createToken(s).subscribe(
        (resp: any) => {
          localStorage.setItem('token', resp.token);
          this.error = false;
          // Check if the address is valid
          this.auth.address().subscribe(
            (_resp: any) => {
              this.error = false;
              this.spinner = false;
              this.auth.loggedin.next(true);
              this.router.navigate(['/assets']);
            },
            (err: any) => {
              this.error = true;
              this.spinner = false;
              this.loginForm.reset();
              this.auth.cleanForm.next(true);
            }
          );
        },
        (err: any) => {
          this.error = true;
          this.spinner = false;
          this.loginForm.reset();
          this.auth.cleanForm.next(true);
        }
      );
    }
  }

}
