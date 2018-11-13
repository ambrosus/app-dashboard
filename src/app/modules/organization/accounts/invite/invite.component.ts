import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { Subscription } from 'rxjs';
import { OrganizationsService } from 'app/services/organizations.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
})
export class InviteComponent implements OnInit, OnDestroy {
  inviteForm: FormGroup;
  sendInvitesSub: Subscription;
  spinner;
  error;
  success;

  constructor(
    private storageService: StorageService,
    private organizationsService: OrganizationsService,
  ) {
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

  ngOnDestroy() {
    if (this.sendInvitesSub) {
      this.sendInvitesSub.unsubscribe();
    }
  }

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

    if (body.email.length) {
      this.organizationsService
        .createInvites(body)
        .then((invitesCreated: any) => {
          this.success = 'Invites sent';
          console.log('[CREATE] Invites: ', invitesCreated);
        })
        .catch(error => console.error('[CREATE] Invites: ', error));
    } else {
      this.error = 'Send at least one invite';
    }
  }
}
