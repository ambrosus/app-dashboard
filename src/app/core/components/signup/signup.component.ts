import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
    secretForm?: FormGroup,
    requestForm?: FormGroup
  } = {};

  requestOrganizationSub: Subscription;
  routeSub: Subscription;
  getInviteSub: Subscription;
  error;
  success;
  promiseAction;
  web3;
  saved;
  step = 'keysOptions';
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
    this.forms.secretForm = new FormGroup({
      privateKey: new FormControl(null, [Validators.required]),
      publicKey: new FormControl({ value: null, disabled: true }, [Validators.required]),
      saved: new FormControl(null, [Validators.requiredTrue]),
    });
    this.forms.requestForm = new FormGroup({
      title: new FormControl(null, []),
      email: new FormControl(null, [Validators.required]),
      message: new FormControl(null, [Validators.required]),
      terms: new FormControl(null, [Validators.requiredTrue]),
    });
  }

  ngOnDestroy() {
    if (this.requestOrganizationSub) { this.requestOrganizationSub.unsubscribe(); }
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.getInviteSub) { this.getInviteSub.unsubscribe(); }
  }

  getInvite() {
    this.getInviteSub = this.inviteService.verifyInvite(this.token).subscribe(
      (resp: any) => {
        this.invite = resp;
        console.log('GET INVITE: ', this.invite);
      },
      err => this.router.navigate(['/login']),
    );
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
        this.step = 'requestForm';
        reject();
      });
    });
  }

  inviteRegisterUser() {

  }

  requestOrganization() {
    this.error = false;
    const { address } = this.forms.secretForm.getRawValue();
    const data = this.forms.requestForm.getRawValue();
    data.address = address;

    if (!this.forms.requestForm.valid) { return this.error = 'Please fill all required fields'; }

    this.promiseAction = new Promise((resolve, reject) => {
      // Check if organization exists
      this.requestOrganizationSub = this.organizationsService.requestOrganization(data).subscribe(
        (resp: any) => {
          this.step = 'success';
          resolve();
        },
        err => {
          console.error('Request Organization: ', err);
          this.error = err.error ? err.error.message : 'Request error';
          reject();
        },
      );
    });
  }
}
