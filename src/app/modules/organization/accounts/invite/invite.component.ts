import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { OrganizationsService } from 'app/services/organizations.service';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InviteComponent implements OnInit {
  inviteForm: FormGroup;
  form = true;

  constructor(
    private organizationsService: OrganizationsService,
    private router: Router,
  ) {
    this.inviteForm = new FormGroup({
      members: new FormArray([
        new FormGroup({
          email: new FormControl('', []),
        }),
      ]),
    });
  }

  stringify = JSON.stringify;

  ngOnInit() { }

  remove(array, index: number) {
    (<FormArray>this.inviteForm.get(array)).removeAt(index);
  }

  addMember() {
    (<FormArray>this.inviteForm.get('members')).push(
      new FormGroup({
        email: new FormControl('', []),
      }),
    );
  }

  cancel() {
    this.router.navigate([`${location.pathname}`]);
  }

  async send(): Promise<any> {
    try {
      const email = this.inviteForm.value.members.reduce(
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

    } catch (error) {
      console.error('[CREATE] Invites: ', error);
    }
  }
}
