import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
  inviteForm: FormGroup;
  spinner = false;
  errorInvite = false;
  successInvite = false;
  message = false;

  constructor() {
    this.initInviteForm();
  }

  initInviteForm() {
    this.inviteForm = new FormGroup({
      members: new FormArray([
        new FormGroup({
          email: new FormControl('', [Validators.required]),
          name: new FormControl('', [])
        }),
        new FormGroup({
          email: new FormControl('', [Validators.required]),
          name: new FormControl('', [])
        })
      ]),
      message: new FormControl('', [])
    });
  }

  ngOnInit() {
  }

  // Methods for adding/removing new fields to the form
  remove(array, index: number) {
    (<FormArray>this.inviteForm.get(array)).removeAt(index);
  }

  addMember() {
    (<FormArray>this.inviteForm.get('members')).push(
      new FormGroup({
        email: new FormControl('', [Validators.required]),
        name: new FormControl('', [])
      })
    );
  }

  errorsResetInvite() {
    this.errorInvite = false;
  }

  invite() {
    this.errorsResetInvite();
    const members = this.inviteForm.get('members')['controls'];

    if (this.inviteForm.valid && members.length > 0) {
      this.spinner = true;
      console.log(this.generateInviteObject());

      setTimeout(() => {
        this.spinner = false;
        this.successInvite = true;

        setTimeout(() => {
          this.successInvite = false;
        }, 1500);
      }, 1500);
    } else {
      this.errorInvite = true;
    }
  }

  generateInviteObject() {
    const invites = {
      message: this.inviteForm.get('message').value
    };

    // Invitees
    const members = this.inviteForm.get('members')['controls'];
    if (members.length > 0) {
      invites['members'] = [];
      members.map((member) => {
        invites['members'].push({
          email: member.get('email').value,
          name: member.get('name').value
        });
      });
    }

    return invites;
  }
}
