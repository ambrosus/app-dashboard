import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DashboardService } from 'app/services/dashboard.service';

import * as moment from 'moment-timezone';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetupComponent implements OnInit {

  formsPromise;

  forms: {
    hermes?: FormGroup,
    company?: FormGroup,
    user?: FormGroup
  } = { };

  currentStep: number = 0;

  timezones = [];

  address;
  secret;

  constructor(
    private router: Router,
    private _auth: AuthService,
    private Dashboard: DashboardService
    ) {

    this.timezones = moment.tz.names();

    this.forms.hermes = new FormGroup({
      title: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(40),
      ])),
      url: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(4),
      ])),
    });

    this.forms.company = new FormGroup({
      title: new FormControl('', [Validators.required]),
      timezone: new FormControl('', [Validators.required]),
      settings: new FormGroup({
        preview_app: new FormControl(''),
      }),
    });

    this.forms.user = new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email,
      ])),
      password: new FormControl('', [Validators.required]),
      passwordConfirm: new FormControl('', Validators.compose([
        Validators.required,
        this.comparePasswords.bind(this)
      ])),
    });
  }

  ngOnInit() {}

  comparePasswords(fieldControl: FormControl) {

    try {
      return fieldControl.value === this.forms.user.value.password ? null : { NotEqual: true }
    } catch (e) { return null }

  }

  setup() {

    const data = {
      hermes: this.forms.hermes.value,
      company: this.forms.company.value,
      user: this.forms.user.value,
    };

    this.formsPromise = new Promise((resolve, reject) => {

      this.Dashboard.initSetup(data).subscribe(({ address, secret }) => {
        this.address = address;
        this.secret = secret;

        resolve();
      })

    });

  }
}
