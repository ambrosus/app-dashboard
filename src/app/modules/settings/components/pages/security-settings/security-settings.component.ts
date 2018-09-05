import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from 'app/services/users.service';
import { StorageService } from 'app/services/storage.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss']
})
export class SecuritySettingsComponent implements OnInit {

  sessions;
  spinner: Boolean = true;
  resetForm: FormGroup;
  resetSuccess: Boolean = false;
  spinner: Boolean = false;
  error;

  constructor(
    private http: HttpClient,
    private userService: UsersService,
    private storage: StorageService
  ) {
    this.resetForm = new FormGroup({
      oldPassword: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      passwordConfirm: new FormControl(null, [Validators.required]),
    });
  }


  ngOnInit() {
    const email = this.storage.get('user')['email'];
    this.http.get(`/api/auth/sessions/${email}`).subscribe(
      resp => {
        console.log(resp);
        this.sessions = resp;
        this.spinner = false;
      },
      err => {
        console.log(err);
      }
    );
  }

  logoutSession(sessionId) {
    this.http.delete(`/api/auth/session/${sessionId}`).subscribe(
      resp => {
        this.ngOnInit();
      },
      err => {
        console.log(err);
      }
    );
  }

  changePassword() {
    this.resetErrors();
    const email = this.storage.get('user')['email'];
    console.log(email);
    const newPassword = this.resetForm.get('password').value;
    const oldPassword = this.resetForm.get('oldPassword').value;
    const passwordConfirm = this.resetForm.get('passwordConfirm').value;

    if (!email || !newPassword || !oldPassword || !passwordConfirm) {
      this.error = 'All fields are required';
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

  resetErrors() {
    this.error = false;
    this.resetSuccess = false;
  }

}
