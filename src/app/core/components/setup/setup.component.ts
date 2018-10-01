import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as moment from 'moment-timezone';
import { AuthService } from 'app/services/auth.service';
import { Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';

declare let Web3: any;
@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetupComponent implements OnInit {

  forms: {
    hermes?: FormGroup,
    company?: FormGroup,
    user?: FormGroup
  } = {}

  formsPromise;

  currentStep: number = 0;

  error;
  timezones = [];
  web3;
  address;
  secret;

  constructor(private http: HttpClient, private router: Router, private Dashboard: DashboardService) {

    this.web3 = new Web3();

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

  ngOnInit() {
  }

  comparePasswords(fieldControl: FormControl) {

    try {
      return fieldControl.value === this.forms.user.value.password ? null : { NotEqual: true }
    } catch (e) { return null }

  }

  setup() {

    const body = {
      hermes: this.forms.hermes.value,
      company: this.forms.company.value,
      user: this.forms.user.value,
    };

    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));

    body.user.token = JSON.stringify(this.web3.eth.accounts.encrypt(privateKey, body.user.password));
    body.user.address = address;

    this.formsPromise = new Promise((resolve, reject) => {
      this.address = address;
      this.secret = privateKey;
    });

    this._auth.login(body.user.email, body.user.password).subscribe(() => {
      this.router.navigate(['/assets']);
    })



  }
}
