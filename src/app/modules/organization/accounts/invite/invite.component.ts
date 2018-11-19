import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { OrganizationsService } from 'app/services/organizations.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
})
export class InviteComponent implements OnInit {
  inviteForm: FormGroup;
  spinner;
  error;
  success;

  constructor(private organizationsService: OrganizationsService) {
    this.initInviteForm();
  }

  stringify = JSON.stringify;

  initInviteForm() {
    this.inviteForm = new FormGroup({
      members: new FormArray([
        new FormGroup({
          email: new FormControl('', []),
        }),
      ]),
    });
  }

  ngOnInit() {}

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

  sendInvites() {
    this.error = false;
    this.success = false;

    const email = this.inviteForm.value.members.reduce(
      (_emails, member, array, index) => {
        if (member.email) {
          _emails.push(member.email);
        }
        return _emails;
      },
      [],
    );

    const body = { email };

    if (!body.email.length) {
      this.error = 'Send at least one invite';
    }

    this.organizationsService.createInvites(body).subscribe(
      ({ data }: any) => {
        this.success = 'Invites sent';
        console.log('[CREATE] Invites: ', data);
      },
      error => console.error('[CREATE] Invites: ', error),
    );
  }
}
