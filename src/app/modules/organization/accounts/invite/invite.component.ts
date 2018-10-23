import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { Subscription } from 'rxjs';
import { InviteService } from 'app/services/invite.service';

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
    private inviteService: InviteService
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

  ngOnInit() { }

  ngOnDestroy() {
    if (this.sendInvitesSub) { this.sendInvitesSub.unsubscribe(); }
  }

  remove(array, index: number) { (<FormArray>this.inviteForm.get(array)).removeAt(index); }

  addMember() {
    (<FormArray>this.inviteForm.get('members')).push(
      new FormGroup({
        email: new FormControl('', []),
      })
    );
  }

  invite() {
    this.error = false;
    this.success = false;
    const user: any = this.storageService.get('user');
    delete user.organization.settings;
    const emails = this.inviteForm.value.members.reduce((_emails, member, array, index) => {
      if (member.email) { _emails.push(member.email); }
      return _emails;
    }, []);

    const body = {
      emails,
      user,
    };

    if (this.inviteForm.valid && body.emails.length > 0) {
      this.spinner = true;

      this.sendInvitesSub = this.inviteService.sendInvite(body).subscribe(
        (resp: any) => {
          this.spinner = false;
          this.success = 'Invites sent';
        },
        err => {
          this.error = 'Invites failed';
          console.error('Invites SEND error: ', err);
        }
      );
    } else {
      this.error = 'Send at least one invite';
    }
  }
}
