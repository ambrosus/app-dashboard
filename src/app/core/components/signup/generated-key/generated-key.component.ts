import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { checkAddress } from 'app/util';
import { OrganizationsService } from 'app/services/organizations.service';
import { MatDialog } from '@angular/material';
import { SecureKeysComponent } from '../secure-keys/secure-keys.component';
import { AuthService } from 'app/services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from 'app/services/message.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';

declare let Web3: any;

@Component({
  selector: 'app-generated-key',
  templateUrl: './generated-key.component.html',
  styleUrls: ['./generated-key.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GeneratedKeyComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  forms: {
    keys?: FormGroup;
  } = {};
  promise: any = {};
  web3;
  inviteId;
  invite;
  saveKeys = false;
  saved = false;
  step = 'generate';

  constructor(
    private route: ActivatedRoute,
    private organizationsService: OrganizationsService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.web3 = new Web3();

    this.subs[this.subs.length] = this.route.queryParams.subscribe(
      queryParams => {
        this.inviteId = queryParams.inviteId;
        if (this.inviteId) {
          this.verifyInvite();
        }
      },
    );

    this.forms.keys = new FormGroup({
      privateKey: new FormControl({ value: '', disabled: true }, []),
      address: new FormControl('', [checkAddress(false)]),
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

  async verifyInvite(): Promise<any> {
    try {
      this.invite = await this.organizationsService.verifyInvite(this.inviteId);
      console.log('[GET] Invite verified: ', this.invite);
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }

  openSecureKeysDialog() {
    const dialogRef = this.dialog.open(SecureKeysComponent, {
      panelClass: 'dialog',
    });
  }

  generateKeys() {
    const { address, privateKey } = this.web3.eth.accounts.create(this.web3.utils.randomHex(32));
    this.forms.keys.get('privateKey').setValue(privateKey);
    this.forms.keys.get('address').setValue(address);
    this.step = 'save';
  }

  async savedKeys(): Promise<any> {
    this.promise['keys'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.keys;
        const { address } = form.value;

        if (form.invalid) {
          throw new Error('Public key is required');
        }

        const verified = await this.to(this.authService.verifyAccount(null, address));
        if (verified.error) {
          if (this.invite) {
            try {
              const body = { address };

              await this.organizationsService.acceptInvite(this.inviteId, body);
              this.router.navigate(['/login']);
            } catch (error) {
              reject();
              console.error('[ACCEPT] Invite: ', error);
              this.messageService.error(error);
              throw error;
            }
          } else {
            resolve();
            this.authService.signupAddress = this.forms.keys.value.address;
            this.router.navigate(['/signup/request']);
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

  downloadJSON() {
    const url =
      'data:application/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(this.forms.keys.getRawValue(), null, 2),
      );
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
