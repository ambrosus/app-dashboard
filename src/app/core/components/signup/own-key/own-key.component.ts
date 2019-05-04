/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
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
export class OwnKeyComponent implements OnInit {
  forms: {
    keys?: FormGroup;
  } = {};
  promise: any = {};
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

    this.forms.keys = new FormGroup({
      privateKey: new FormControl({ value: '', disabled: true }, []),
      address: new FormControl('', [checkAddress(false)]),
    });
  }

  to(P: Promise<any>) {
    return P
      .then(response => response)
      .catch(error => ({ error }));
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
          if (this.authService.inviteId) {
            try {
              const body = { address };

              await this.organizationsService.acceptInvite(this.authService.inviteId, body);
              this.messageService.success('Registration successful');
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
          throw new Error('This account already exists, please use another public key/address.');
        }
      } catch (error) {
        console.error('[VERIFY] Account: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }
}
