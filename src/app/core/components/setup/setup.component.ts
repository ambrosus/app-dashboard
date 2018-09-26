import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as moment from 'moment-timezone';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

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
    account?: FormGroup
  } = {}

  setupForm: FormGroup;

  currentStep: number = 1;

  error;
  timezones = [];
  web3;
  address;
  secret;

  constructor(private http: HttpClient, private router: Router, private _auth: AuthService) {

    this.forms.hermes = new FormGroup({
      title: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(40),
      ])),
      url: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(4),
      ]))
    });

    this.forms.company = new FormGroup({
      title: new FormControl('', [Validators.required]),
      timezone: new FormControl('', [Validators.required]),
    })

    this.forms.account = new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    })

    this.web3 = new Web3();

    this.timezones = moment.tz.names();
  }

  ngOnInit() { }

  setup() {

    const body = {
      hermes: this.forms.hermes.value,
      company: this.forms.company.value,
      user: this.forms.account.value,
    };

    console.log(body);

    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));

    console.log('address: ', address);
    console.log('privateKey: ', privateKey);

    body.user.token = JSON.stringify(this.web3.eth.accounts.encrypt(privateKey, body.user.password));
    body.user.address = address;

    this.http.post('/api/setup', body).subscribe(
      (resp: any) => {
        this._auth.login(body.user.email, body.user.password).subscribe(() => {
          this.router.navigate(['/assets']);
        })
      },
      err => {
        const error = err.error.message ? err.error.message : 'Setup error';
        console.log('Setup error: ', error);
      }
    );

  }
}
