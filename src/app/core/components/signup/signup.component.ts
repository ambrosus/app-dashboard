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
          this.verifyInvite().then();
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

  async verifyInvite(): Promise<any> {
    try {
      this.invite = this.organizationsService.verifyInvite(this.inviteId);
      console.log('[GET] Invite verified: ', this.invite);
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }

  generateKeys() {
    const { address, privateKey } = this.web3.eth.accounts.create(
      this.web3.utils.randomHex(32),
    );
    this.forms.privateKeyForm.get('privateKey').setValue(privateKey);
    this.forms.privateKeyForm.get('address').setValue(address);
    this.step = 'saveKeys';
  }

  async verifyAccount(): Promise<any> {
    this.errorPrivateKeyForm = false;
    const form = this.forms.privateKeyForm;
    const { privateKey } = form.getRawValue();

    try {
      if (form.invalid) {
        throw new Error('Public key is required');
      }

      this.promiseActionPrivateKeyForm = new Promise(async (resolve, reject) => {
        this.authService.verifyAccount(privateKey)
          .then(resp => {
            console.log('[VERIFY] Account: ', resp);
            throw new Error('This account is already registered, please use another private key');
          })
          .catch(error => {
            this.generateAddress(privateKey);
            return this.step = 'saveKeys';
          });
      });
    } catch (error) {
      console.error('[VERIFY] Account: ', error);
      this.errorPrivateKeyForm = error;
    }
  }

  async savedKeys(): Promise<any> {
    if (this.invite) {
      const { address } = this.forms.privateKeyForm.getRawValue();
      const body = { address };

      try {
        await this.organizationsService.acceptInvite(this.inviteId, body);
        this.router.navigate(['/login']);
      } catch (error) {
        console.error('[ACCEPT] Invite: ', error);
        this.errorPrivateKeyForm = 'Account creation failed, please contact support';
      }
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

  async requestOrganization(): Promise<any> {
    this.errorRequestForm = false;
    const { address } = this.forms.privateKeyForm.getRawValue();
    const form = this.forms.requestForm;
    const data = form.getRawValue();
    data.address = address;

    try {
      if (form.invalid) {
        throw new Error('Please fill all required fields');
      }

      this.promiseActionRequestForm = new Promise(async (resolve, reject) => {
        const organizationRequest = await this.organizationsService.createOrganizationRequest(data);
        console.log('[REQUEST] Organization: ', organizationRequest);
        return this.step = 'success';
      });
    } catch (error) {
      console.error('[REQUEST] Organization: ', error);
      this.errorRequestForm = error;
    }
  }
}
