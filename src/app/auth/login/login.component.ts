import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: boolean = false;
  spinner: boolean = false;

  constructor(private auth: AuthService,
              private router: Router) {
    this.loginForm = new FormGroup({
      'address': new FormControl(null, [Validators.required]),
      'secret': new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() { }

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
            (resp: any) => {
              this.error = false;
              this.spinner = false;
              this.auth.loggedin.next(true);
              this.router.navigate(['/dashboard']);
            },
            (err: any) => {
              this.error = true;
              this.spinner = false;
              this.loginForm.reset();
            }
          );
        },
        (err: any) => {
          this.error = true;
          this.spinner = false;
          this.loginForm.reset();
        }
      );
    }
  }

}
