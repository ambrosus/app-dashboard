import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { OrganizationsService } from 'app/services/organizations.service';
import { AccountsService } from 'app/services/accounts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InviteService } from 'app/services/invite.service';
import { DomSanitizer } from '@angular/platform-browser';

declare let Web3: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SignupComponent implements OnInit, OnDestroy {
  requestOrganizationSub: Subscription;
  routeSub: Subscription;
  getInviteSub: Subscription;
  createAccountSub: Subscription;
  verifyAccountSub: Subscription;
  forms: {
    privateKeyForm?: FormGroup,
    requestForm?: FormGroup
  } = {};
  errorPrivateKeyForm;
  errorRequestForm;
  success;
  promiseActionPrivateKeyForm;
  promiseActionRequestForm;
  web3;
  saved = false;
  step = 'options';
  token;
  invite;

  constructor(
    private authService: AuthService,
    private organizationsService: OrganizationsService,
    private accountsService: AccountsService,
    private route: ActivatedRoute,
    private inviteService: InviteService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {
    this.web3 = new Web3();
  }

  ngOnInit() {
    this.routeSub = this.route.queryParams.subscribe(queryParams => {
      this.token = queryParams.token;
      if (this.token) { this.getInvite(); }
    });
    this.forms.privateKeyForm = new FormGroup({
      privateKey: new FormControl(null, [Validators.required, this.validatePrivateKey]),
      address: new FormControl({ value: null, disabled: true }, [Validators.required]),
    });
    this.forms.requestForm = new FormGroup({
      title: new FormControl(null, []),
      email: new FormControl(null, [Validators.required, this.validateEmail]),
      message: new FormControl(null, [Validators.required]),
      terms: new FormControl(null, [Validators.requiredTrue]),
    });
  }

  ngOnDestroy() {
    if (this.requestOrganizationSub) { this.requestOrganizationSub.unsubscribe(); }
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.getInviteSub) { this.getInviteSub.unsubscribe(); }
    if (this.createAccountSub) { this.createAccountSub.unsubscribe(); }
    if (this.verifyAccountSub) { this.verifyAccountSub.unsubscribe(); }
  }

  validatePrivateKey(control: AbstractControl) {
    try {
      const web3 = new Web3();
      console.log(web3.eth.accounts.privateKeyToAccount(control.value).address);
      return null;
    } catch (e) { return { 'Private key is invalid': control.value }; }
  }

  validateEmail(control: AbstractControl) {
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailPattern.test(control.value)) {
      return { 'Email is invalid': control.value };
    }
    return null;
  }

  getInvite() {
    this.getInviteSub = this.inviteService.verifyInvite(this.token).subscribe(
      (resp: any) => {
        this.invite = resp;
        console.log('[GET] Invite: ', this.invite);
      },
      err => this.router.navigate(['/login']),
    );
  }

  generateKeys() {
    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
    this.forms.privateKeyForm.get('privateKey').setValue(privateKey);
    this.forms.privateKeyForm.get('address').setValue(address);
    this.step = 'saveKeys';
  }

  verifyAccount() {
    this.errorPrivateKeyForm = false;
    const form = this.forms.privateKeyForm;
    const { privateKey } = form.getRawValue();

    if (form.invalid) { return this.errorPrivateKeyForm = 'Public key is required'; }

    this.promiseActionPrivateKeyForm = new Promise((resolve, reject) => {
      this.verifyAccountSub = this.authService.verifyAccount(privateKey).subscribe(
        (resp: any) => {
          console.log('[VERIFY] Account: ', resp);
          this.errorPrivateKeyForm = 'This account is already registered, please use another private key';
          resolve();
        },
        err => {
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
      // Account create request
      const body = {
        token: this.token,
        address,
      };
      this.createAccountSub = this.accountsService.createUser(body).subscribe(
        resp => this.router.navigate(['/login']),
        error => {
          console.error('[CREATE] Account: ', error);
          this.errorPrivateKeyForm = 'Account creation failed';
        },
      );
    } else {
      this.step = 'requestForm';
    }
  }

  generateAddress(privateKey) {
    this.errorPrivateKeyForm = false;
    try {
      const address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
      this.forms.privateKeyForm.get('privateKey').setValue(privateKey);
      this.forms.privateKeyForm.get('address').setValue(address);
    } catch (e) {
      this.errorPrivateKeyForm = 'Private key is invalid';
      this.forms.privateKeyForm.get('address').setValue(null);
    }
  }

  downloadJSON() {
    const url = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.forms.privateKeyForm.getRawValue(), null, 2));
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  requestOrganization() {
    this.errorRequestForm = false;
    const { address } = this.forms.privateKeyForm.getRawValue();
    const form = this.forms.requestForm;
    const data = form.getRawValue();
    data.address = address;

    if (form.invalid) { return this.errorRequestForm = 'Please fill all required fields'; }

    this.promiseActionRequestForm = new Promise((resolve, reject) => {
      this.requestOrganizationSub = this.organizationsService.createOrganizationRequest(data).subscribe(
        (resp: any) => {
          console.log('[REQUEST] Organization: ', resp);
          this.step = 'success';
          resolve();
        },
        err => {
          console.error('[REQUEST] Organization: ', err);
          this.errorRequestForm = err ? err.message : 'Request failed, please contact support';
          reject();
        },
      );
    });
  }
}
