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
import { MessageService } from 'app/services/message.service';

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
    privateKey?: FormGroup;
    request?: FormGroup;
  } = {};
  promise: any = {};
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
    private messageService: MessageService,
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
    this.forms.privateKey = new FormGroup({
      privateKey: new FormControl('', [
        Validators.required,
        this.validatePrivateKey,
      ]),
      address: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
    });
    this.forms.request = new FormGroup({
      title: new FormControl('', []),
      email: new FormControl('', [Validators.required, this.validateEmail]),
      message: new FormControl('', [Validators.required]),
      terms: new FormControl('', [Validators.requiredTrue]),
    });
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  to(P: Promise<any>) {
    return P
      .then(response => response)
      .catch(error => ({ error }));
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
      this.invite = await this.organizationsService.verifyInvite(this.inviteId);
      console.log('[GET] Invite verified: ', this.invite);
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }

  generateKeys() {
    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
    this.forms.privateKey.get('privateKey').setValue(privateKey);
    this.forms.privateKey.get('address').setValue(address);
    this.step = 'saveKeys';
  }

  verifyAccount() {
    this.promise['privateKey'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.privateKey;
        const { privateKey } = form.getRawValue();

        if (form.invalid) {
          throw new Error('Public key is required');
        }

        const verified = await this.to(this.authService.verifyAccount(privateKey));
        if (verified.error) {
          this.generateAddress(privateKey);
          resolve();
          if (this.invite) {
            try {
              const { address } = this.forms.privateKey.getRawValue();
              const body = { address };

              await this.organizationsService.acceptInvite(this.inviteId, body);
              this.router.navigate(['/login']);
            } catch (error) {
              console.error('[ACCEPT] Invite: ', error);
              this.messageService.error(error);
              throw error;
            }
          } else {
            this.step = 'requestForm';
          }
        } else {
          console.log('[VERIFY] Account: ', verified);
          throw new Error('This account already exists, please use another private key');
        }
      } catch (error) {
        console.error('[VERIFY] Account: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }

  async savedKeys(): Promise<any> {
    this.step = 'requestForm';
  }

  generateAddress(privateKey) {
    try {
      const address = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
      this.forms.privateKey.get('privateKey').setValue(privateKey);
      this.forms.privateKey.get('address').setValue(address);
    } catch (error) {
      this.forms.privateKey.get('address').setValue(null);
      this.messageService.error(error);
    }
  }

  downloadJSON() {
    const url =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(this.forms.privateKey.getRawValue(), null, 2),
      );
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  async requestOrganization(): Promise<any> {
    this.promise['request'] = new Promise(async (resolve, reject) => {
      try {
        const { address } = this.forms.privateKey.getRawValue();
        const form = this.forms.request;
        const { title, email, message } = form.getRawValue();
        const body = {
          address,
          title,
          email,
          message,
        };

        if (form.invalid) {
          throw new Error('Please fill all required fields');
        }

        const organizationRequest = await this.organizationsService.createOrganizationRequest(body);
        console.log('[REQUEST] Organization: ', organizationRequest);
        this.step = 'success';
        resolve();
      } catch (error) {
        console.error('[REQUEST] Organization: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }
}
