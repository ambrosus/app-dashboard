import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { OrganizationsService } from 'app/services/organizations.service';
import { AuthService } from 'app/services/auth.service';
import { MessageService } from 'app/services/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { checkAddress } from 'app/util';

declare let Web3: any;

@Component({
  selector: 'app-own-key',
  templateUrl: './own-key.component.html',
  styleUrls: ['./own-key.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OwnKeyComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  forms: {
    keys?: FormGroup;
  } = {};
  promise: any = {};
  inviteId;
  invite;
  web3;

  constructor(
    private organizationsService: OrganizationsService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
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

  verifyAccount() {
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
            this.authService.signupAddress = address;
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
}
