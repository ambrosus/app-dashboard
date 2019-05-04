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

import { Component } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { OrganizationsService } from 'app/services/organizations.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { Router } from '@angular/router';
import { MessageService } from 'app/services/message.service';
import { checkEmail } from 'app/util';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InviteComponent {
  forms: {
    invite?: FormGroup,
  } = {};
  form = true;
  promise: any = {};

  constructor(
    private organizationsService: OrganizationsService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.forms.invite = new FormGroup({
      members: new FormArray([
        new FormGroup({
          email: new FormControl('', [checkEmail()]),
        }),
      ]),
    });
  }

  stringify = JSON.stringify;

  remove(array, index: number) {
    (<FormArray>this.forms.invite.get(array)).removeAt(index);
  }

  addMember() {
    (<FormArray>this.forms.invite.get('members')).push(
      new FormGroup({
        email: new FormControl('', []),
      }),
    );
  }

  send() {
    this.promise['send'] = new Promise(async (resolve, reject) => {
      try {
        const email = this.forms.invite.value.members.reduce(
          (emails, member, array, index) => {
            if (member.email) {
              emails.push(member.email);
            }
            return emails;
          },
          [],
        );

        if (!email.length) {
          throw new Error('Send at least one invite');
        }

        const invitesSent = await this.organizationsService.createInvites({ email });
        console.log('[CREATE] Invites: ', invitesSent);

        this.messageService.success('Invites sent');

        resolve();
      } catch (error) {
        console.error('[CREATE] Invites: ', error);
        this.messageService.error(error);
        reject();
      }
    });
  }
}
