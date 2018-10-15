import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';

declare let Web3: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SignupComponent implements OnInit {
  forms: {
    secretForm?: FormGroup,
    userForm?: FormGroup
  } = {};

  error;
  success;
  promiseAction;
  web3;
  saved;
  steps = {
    currentStep: 1,
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.web3 = new Web3();
  }

  ngOnInit() {
    this.forms.secretForm = new FormGroup({
      secret: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
    });
    this.forms.userForm = new FormGroup({
      organization: new FormControl(null, []),
      full_name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
      password_confirm: new FormControl(null, [Validators.required]),
    });
  }

  generateKeys() {
    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
    this.forms.secretForm.get('secret').setValue(privateKey);
    this.forms.secretForm.get('address').setValue(address);
    this.steps.currentStep = 2;
  }

  generateAddress(secret) {
    this.error = false;
    let address;
    try {
      address = this.web3.eth.accounts.privateKeyToAccount(secret.value).address;
      this.forms.secretForm.get('secret').setValue(secret.value);
      this.forms.secretForm.get('address').setValue(address);
    } catch (e) {
      this.error = 'Please insert valid secret';
      this.forms.secretForm.get('address').setValue(null);
    }
  }

  downloadJSON() {
    const filename = 'Private/public keys';
    const data = JSON.stringify(this.forms.secretForm.value, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  verifyAccount() {
    this.error = false;
    const data = this.forms.secretForm.value;

    if (!this.forms.secretForm.valid) { return this.error = 'Secret is required'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.verifyAccount(data.secret).subscribe((resp: any) => {
        this.error = 'This account is already registered, please insert another secret';
        resolve();
      }, err => {
        this.steps.currentStep = 3;
        reject();
        this.promiseAction = false;
      });
    });
  }

  registerUser() {
    this.error = false;
    const data = this.forms.userForm.value;

    if (!this.forms.userForm.valid) { return this.error = 'Please fill all required fields'; }
    if (data.password !== data.password_confirm) { return this.error = 'Password and password again do not match'; }

    this.promiseAction = new Promise((resolve, reject) => {
      resolve();
    });
  }
}
