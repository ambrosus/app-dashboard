import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as moment from 'moment-timezone';

declare let Web3: any;
@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SetupComponent implements OnInit {

  forms: {
    hermes: FormGroup,
    company: FormGroup,
    account: FormGroup
  }

  setupForm: FormGroup;

  error;
  spinner = false;
  stepHermes;
  stepCompany;
  stepUser;
  currentStep = 1;
  prevButton = '';
  nextButton = '';
  timezones = [];
  web3;
  success;
  address;
  secret;

  constructor(private http: HttpClient) {

    this.forms.hermes = new FormGroup({
      title: new FormControl('', [Validators.required]),
      url: new FormControl('', [Validators.required]),
    });

    this.forms.company = new FormGroup({
      title: new FormControl('', [Validators.required]),
      timeZone: new FormControl('', [Validators.required]),
    })

    this.forms.account = new FormGroup({
      fullname: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    })

    this.web3 = new Web3();

    this.timezones = moment.tz.names();
    console.log(this.timezones);
  }

  ngOnInit() {

  }

  changeStep(type) {
    switch (this.currentStep) {
      case 1:
        if (type && this.stepHermes) {
          this.currentStep++;
        }
        break;
      case 2:
        if (type === 'prev') {
          this.currentStep--;
        } else if (this.stepCompany) {
          this.currentStep++;
        }
        break;
      case 3:
        if (type) {
          this.currentStep--;
        }
    }
  }

  stepClass() {
    return 'animated';
  }

  checkStep() {
    switch (this.currentStep) {
      case 1:
        const hermesTitle = this.setupForm.get('hermesTitle').value;
        const hermesUrl = this.setupForm.get('hermesUrl').value;
        this.stepHermes = hermesTitle !== '' && hermesUrl !== '';
        return this.stepHermes;
      case 2:
        const companyTitle = this.setupForm.get('companyTitle').value;
        const companyTimeZone = this.setupForm.get('companyTimeZone').value;
        this.stepCompany = companyTitle !== '' && companyTimeZone !== '';
        return this.stepCompany;
    }
  }

  setupReset() {
    this.error = null;
    this.success = null;
  }

  setup() {
    this.setupReset();
    const body: any = {
      hermes: {
        title: this.setupForm.get('hermesTitle').value,
        url: this.setupForm.get('hermesUrl').value
      },
      company: {
        title: this.setupForm.get('companyTitle').value,
        settings: JSON.stringify({ timeZone: this.setupForm.get('companyTimeZone').value })
      },
      user: {
        full_name: this.setupForm.get('userFullName').value,
        email: this.setupForm.get('userEmail').value,
        password: this.setupForm.get('userPassword').value,
        passwordConfirm: this.setupForm.get('userPasswordConfirm').value
      }
    };

    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));

    if (this.setupForm.valid) {
      if (!(body.user.password === body.user.passwordConfirm)) {
        this.error = 'Passwords do not match';
        return;
      }
      this.spinner = true;

      const url = `/api/setup`;
      body.user['token'] = JSON.stringify(this.web3.eth.accounts.encrypt(privateKey, body.user.password));
      body.user['address'] = address;

      this.http.post(url, body).subscribe(
        (resp: any) => {
          this.address = address;
          this.secret = privateKey;
          this.spinner = false;
          this.success = true;
          console.log('Setup success: ', resp);
        },
        err => {
          this.spinner = false;
          this.error = err.error.message ? err.error.message : 'Setup error';
          console.log('Setup error: ', err);
        }
      );
    } else {
      this.error = 'All steps are required';
    }
  }
}
