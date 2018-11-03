import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { OrganizationsService } from 'app/services/organizations.service';
import { UsersService } from 'app/services/users.service';
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
  forms: {
    privateKeyForm?: FormGroup,
    requestForm?: FormGroup
  } = {};
  requestOrganizationSub: Subscription;
  routeSub: Subscription;
  getInviteSub: Subscription;
  createAccountSub: Subscription;
  error;
  success;
  promiseAction;
  web3;
  saved = false;
  step = 'options';
  token;
  invite;

  constructor(
    private authService: AuthService,
    private organizationsService: OrganizationsService,
    private usersService: UsersService,
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
      publicKey: new FormControl({ value: null, disabled: true }, [Validators.required]),
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
  }

  validatePrivateKey(control: AbstractControl) {
    try {
      const web3 = new Web3();
      console.log(web3.eth.accounts.privateKeyToAccount(control.value).address);
      return null;
    } catch (e) { return { 'Invalid private key': control.value }; }
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
    this.forms.privateKeyForm.get('publicKey').setValue(address);
    this.step = 'saveKeys';
  }

  verifyAccount() {
    this.error = false;
    const { privateKey } = this.forms.privateKeyForm.getRawValue();

    if (!this.forms.privateKeyForm.valid) { return this.error = 'Public key is required'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.authService.verifyAccount(privateKey).subscribe(
        (resp: any) => {
          console.log(resp);
          this.error = 'This account is already registered, please use another private key';
          resolve();
        }, err => {
          this.generateAddress(privateKey);
          this.step = 'saveKeys';
          reject();
        });
    });
  }

  savedKeys() {
    if (this.invite) {
      const { publicKey } = this.forms.privateKeyForm.getRawValue();
      // Account create request
      const body = {
        token: this.token,
        address: publicKey,
      };
      this.createAccountSub = this.usersService.createUser(body).subscribe(
        resp => this.router.navigate(['/login']),
        error => {
          console.error('[CREATE] Account: ', error);
          this.error = 'Account creation failed';
        },
      );
    } else {
      this.step = 'requestForm';
    }
  }

  generateAddress(privateKey) {
    this.error = false;
    try {
      const address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
      this.forms.privateKeyForm.get('privateKey').setValue(privateKey);
      this.forms.privateKeyForm.get('publicKey').setValue(address);
    } catch (e) {
      this.error = 'Please insert valid secret';
      this.forms.privateKeyForm.get('address').setValue(null);
    }
  }

  downloadJSON() {
    const url = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.forms.privateKeyForm.getRawValue(), null, 2));
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  requestOrganization() {
    this.error = false;
    const { publicKey } = this.forms.privateKeyForm.getRawValue();
    const data = this.forms.requestForm.getRawValue();
    data.address = publicKey;

    if (this.forms.requestForm.invalid) { return this.error = 'Please fill all required fields'; }

    this.promiseAction = new Promise((resolve, reject) => {
      this.requestOrganizationSub = this.organizationsService.organizationRequest(data).subscribe(
        (resp: any) => {
          this.step = 'success';
          resolve();
        },
        err => {
          console.error('[REQUEST] Organization: ', err);
          this.error = 'Request failed, please contact support';
          reject();
        },
      );
    });
  }
}
