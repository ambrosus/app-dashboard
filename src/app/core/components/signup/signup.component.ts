import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { CompaniesService } from 'app/services/companies.service';
import { UsersService } from 'app/services/users.service';
import { DomSanitizer } from '@angular/platform-browser';

declare let Web3: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SignupComponent implements OnInit, OnDestroy {
  forms: {
    secretForm?: FormGroup,
    userForm?: FormGroup
  } = {};

  organizationCheck: Subscription;
  userRegister: Subscription;
  error;
  success;
  promiseAction;
  web3;
  saved;
  step = 'keysOptions';

  constructor(
    private authService: AuthService,
    private companiesService: CompaniesService,
    private usersService: UsersService,
    private sanitizer: DomSanitizer,
  ) {
    this.web3 = new Web3();
  }

  ngOnInit() {
    this.forms.secretForm = new FormGroup({
      privateKey: new FormControl(null, [Validators.required]),
      publicKey: new FormControl({ value: null, disabled: true }, [Validators.required]),
      saved: new FormControl(null, [Validators.requiredTrue]),
    });
    this.forms.userForm = new FormGroup({
      organization: new FormControl(null, []),
      email: new FormControl(null, [Validators.required]),
      reason: new FormControl(null, [Validators.required]),
      terms: new FormControl(null, [Validators.requiredTrue]),
    });
  }

  ngOnDestroy() {
    if (this.organizationCheck) { this.organizationCheck.unsubscribe(); }
    if (this.userRegister) { this.userRegister.unsubscribe(); }
  }

  generateKeys() {
    const { address, secret } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
    this.forms.secretForm.get('privateKey').setValue(secret);
    this.forms.secretForm.get('publicKey').setValue(address);
    this.step = 'keysGenerate';
  }

  generateAddress(secret) {
    this.error = false;
    let address;
    try {
      address = this.web3.eth.accounts.privateKeyToAccount(secret.value).address;
      this.forms.secretForm.get('privateKey').setValue(secret.value);
      this.forms.secretForm.get('publicKey').setValue(address);
    } catch (e) {
      this.error = 'Please insert valid secret';
      this.forms.secretForm.get('address').setValue(null);
    }
  }

  downloadJSON() {
    const url = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.forms.secretForm.value, null, 2));
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  verifyAccount() {
    this.error = false;
    const { privateKey } = this.forms.secretForm.getRawValue();

    if (!this.forms.secretForm.valid) { return this.error = 'Secret is required'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.verifyAccount(privateKey).subscribe((resp: any) => {
        console.log(resp);
        this.error = 'This account is already registered, please insert another secret';
        resolve();
      }, err => {
        this.step = 'signupForm';
        reject();
      });
    });
  }

  registerUser() {
    this.error = false;
    const { publicKey } = this.forms.secretForm.getRawValue();
    const { organization, email } = this.forms.userForm.getRawValue();
    const data = {
      company: {
        title: organization,
      },
      user: {
        address: publicKey,
        email,
      },
    };

    if (!this.forms.userForm.valid) { return this.error = 'Please fill all required fields'; }

    this.promiseAction = new Promise((resolve, reject) => {
      // Check if organization exists
      this.organizationCheck = this.companiesService.checkCompany({ title: organization }).subscribe(
        res => {
          // Register a user
          this.userRegister = this.usersService.createUser(data).subscribe(
            _res => {
              this.step = 'success';
              resolve();
            },
            err => {
              console.error('User register error: ', err);
              reject();
            },
          );
        },
        err => {
          reject();
          this.error = 'Organization with this name already exists';
        },
      );
    });
  }
}
