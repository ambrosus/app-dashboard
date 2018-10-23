import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { OrganizationsService } from 'app/services/organizations.service';
import { UsersService } from 'app/services/users.service';

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
    private organizationsService: OrganizationsService,
    private usersService: UsersService
  ) {
    this.web3 = new Web3();
  }

  ngOnInit() {
    this.forms.secretForm = new FormGroup({
      secret: new FormControl(null, [Validators.required]),
      address: new FormControl({ value: null, disabled: true }, [Validators.required]),
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
    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
    this.forms.secretForm.get('secret').setValue(privateKey);
    this.forms.secretForm.get('address').setValue(address);
    this.step = 'keysGenerate';
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
    const { secret } = this.forms.secretForm.value;

    if (!this.forms.secretForm.valid) { return this.error = 'Secret is required'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.verifyAccount(secret).subscribe((resp: any) => {
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
    const { address, secret } = this.forms.secretForm.value;
    const { organization, email } = this.forms.userForm.value;
    const data = {
      company: {
        title: organization,
      },
      user: {
        address,
        email,
      },
    };

    if (!this.forms.userForm.valid) { return this.error = 'Please fill all required fields'; }

    this.promiseAction = new Promise((resolve, reject) => {
      // Check if organization exists
      this.organizationCheck = this.organizationsService.checkOrganization({ title: organization }).subscribe(
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
            }
          );
        },
        err => {
          reject();
          this.error = 'Organization with this name already exists';
        }
      );
    });
  }
}
