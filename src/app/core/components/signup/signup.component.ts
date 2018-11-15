import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { OrganizationsService } from 'app/services/organizations.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

declare let Web3: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SignupComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  forms: {
    privateKeyForm?: FormGroup;
    requestForm?: FormGroup;
  } = {};
  errorPrivateKeyForm;
  errorRequestForm;
  success;
  promiseActionPrivateKeyForm;
  promiseActionRequestForm;
  web3;
  saved = false;
  step = 'options';
  inviteId;
  invite;

  constructor(
    private authService: AuthService,
    private organizationsService: OrganizationsService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {
    this.web3 = new Web3();
  }

  ngOnInit() {
    this.subs[this.subs.length] = this.route.queryParams.subscribe(
      queryParams => {
        this.inviteId = queryParams.inviteId;
        if (this.inviteId) {
          this.verifyInvite();
        }
      },
    );
    this.forms.privateKeyForm = new FormGroup({
      privateKey: new FormControl(null, [
        Validators.required,
        this.validatePrivateKey,
      ]),
      address: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
    });
    this.forms.requestForm = new FormGroup({
      title: new FormControl(null, []),
      email: new FormControl(null, [Validators.required, this.validateEmail]),
      message: new FormControl(null, [Validators.required]),
      terms: new FormControl(null, [Validators.requiredTrue]),
    });
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  validatePrivateKey(control: AbstractControl) {
    try {
      const web3 = new Web3();
      console.log(web3.eth.accounts.privateKeyToAccount(control.value).address);
      return null;
    } catch (e) {
      return { 'Private key is invalid': control.value };
    }
  }

  validateEmail(control: AbstractControl) {
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailPattern.test(control.value)) {
      return { 'Email is invalid': control.value };
    }
    return null;
  }

  verifyInvite() {
    this.organizationsService.verifyInvite(this.inviteId).subscribe(
      ({ data }: any) => {
        this.invite = data;
        console.log('[GET] Invite verified: ', data);
      },
      error => this.router.navigate(['/login']),
    );
  }

  generateKeys() {
    const { address, privateKey } = this.web3.eth.accounts.create(
      this.web3.utils.randomHex(32),
    );
    this.forms.privateKeyForm.get('privateKey').setValue(privateKey);
    this.forms.privateKeyForm.get('address').setValue(address);
    this.step = 'saveKeys';
  }

  verifyAccount() {
    this.errorPrivateKeyForm = false;
    const form = this.forms.privateKeyForm;
    const { privateKey } = form.getRawValue();

    if (form.invalid) {
      return (this.errorPrivateKeyForm = 'Public key is required');
    }

    this.promiseActionPrivateKeyForm = new Promise((resolve, reject) => {
      this.authService.verifyAccount(privateKey).subscribe(
        resp => {
          console.log('[VERIFY] Account: ', resp);
          this.errorPrivateKeyForm =
            'This account is already registered, please use another private key';
          resolve();
        },
        error => {
          this.generateAddress(privateKey);
          this.step = 'saveKeys';
          reject();
        },
      );
    });
  }

  savedKeys() {
    if (this.invite) {
      const { address } = this.forms.privateKeyForm.getRawValue();
      const body = { address };
      this.organizationsService.acceptInvite(this.inviteId, body).subscribe(
        inviteAccepted => this.router.navigate(['/login']),
        error => {
          console.error('[ACCEPT] Invite: ', error);
          this.errorPrivateKeyForm =
            'Account creation failed, please contact support';
        },
      );
    } else {
      this.step = 'requestForm';
    }
  }

  generateAddress(privateKey) {
    this.errorPrivateKeyForm = false;
    try {
      const address = this.web3.eth.accounts.privateKeyToAccount(privateKey)
        .address;
      this.forms.privateKeyForm.get('privateKey').setValue(privateKey);
      this.forms.privateKeyForm.get('address').setValue(address);
    } catch (e) {
      this.errorPrivateKeyForm = 'Private key is invalid';
      this.forms.privateKeyForm.get('address').setValue(null);
    }
  }

  downloadJSON() {
    const url =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(this.forms.privateKeyForm.getRawValue(), null, 2),
      );
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  requestOrganization() {
    this.errorRequestForm = false;
    const { address } = this.forms.privateKeyForm.getRawValue();
    const form = this.forms.requestForm;
    const data = form.getRawValue();
    data.address = address;

    if (form.invalid) {
      return (this.errorRequestForm = 'Please fill all required fields');
    }

    this.promiseActionRequestForm = new Promise((resolve, reject) => {
      this.organizationsService.createOrganizationRequest(data).subscribe(
        resp => {
          console.log('[REQUEST] Organization: ', resp);
          this.step = 'success';
          resolve();
        },
        error => {
          console.error('[REQUEST] Organization: ', error);
          this.errorRequestForm = error
            ? error.message
            : 'Request failed, please contact support';
          reject();
        },
      );
    });
  }
}
