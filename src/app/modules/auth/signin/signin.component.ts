import { AuthService } from 'app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SigninComponent implements OnInit {
  // Login form
  loginForm: FormGroup;
  error = false;
  spinner = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private storage: StorageService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {}

  login() {
    const email = this.loginForm.get('email').value;
    const password = this.loginForm.get('password').value;

    if (this.loginForm.valid) {
      this.spinner = true;
      this.error = false;

      // Get and decode the address and secret

      // Get the token with decoded address and secret
      // test
      const address = '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F';
      const secret = '0x2919292749ab4fdf34b1fbb114344f59af96eae79c22afc72c66234ef43c04e0';
      // test
      this.auth.login(address, secret).subscribe(
        resp => {
          this.spinner = false;
          this.auth.loggedin.next(true);
          this.router.navigate(['/assets']);
        },
        err => {
          console.log(err);
          this.error = true;
          this.spinner = false;
          this.auth.cleanForm.next(true);
        }
      );
    } else {
      this.error = true;
    }
  }
}
