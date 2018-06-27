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
      address: new FormControl(null, [Validators.required]),
      secret: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {}

  login() {
    const address = this.loginForm.get('address').value;
    const secret = this.loginForm.get('secret').value;

    if (this.loginForm.valid) {
      this.spinner = true;
      this.error = false;

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