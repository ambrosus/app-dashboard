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

  cancel() {
    this.router.navigate([`${location.pathname}`]);
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
