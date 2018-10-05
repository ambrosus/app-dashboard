import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { InviteService } from 'app/services/invite.service';
import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
})
export class InviteComponent implements OnInit, OnDestroy {
  inviteForm: FormGroup;
  getRolesSub: Subscription;
  sendInvitesSub: Subscription;
  spinner;
  error;
  success;
  roles = [];

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private inviteService: InviteService,
    private usersService: UsersService
  ) {
    this.initInviteForm();
  }

  stringify = JSON.stringify;

  initInviteForm() {
    this.inviteForm = new FormGroup({
      members: new FormArray([
        new FormGroup({
          email: new FormControl('', []),
          accessLevel: new FormControl(1, []),
          role: new FormControl('', []),
        }),
      ]),
      message: new FormControl('', []),
    });
  }

  ngOnInit() {
    this.getRoles();
  }

  ngOnDestroy() {
    if (this.getRolesSub) { this.getRolesSub.unsubscribe(); }
    if (this.sendInvitesSub) { this.sendInvitesSub.unsubscribe(); }
  }

  getRoles() { this.getRolesSub = this.usersService.roles.subscribe(roles => this.roles = roles); }

  remove(array, index: number) { (<FormArray>this.inviteForm.get(array)).removeAt(index); }

  addMember() {
    (<FormArray>this.inviteForm.get('members')).push(
      new FormGroup({
        email: new FormControl('', []),
        accessLevel: new FormControl(1, []),
        role: new FormControl('', []),
      })
    );
  }

  invite() {
    this.error = false;
    this.success = false;
    const user: any = this.storageService.get('user');
    delete user.profile;
    delete user.company.settings;

    const body = {
      invites: this.generateInviteObject(),
      user,
    };

    if (this.inviteForm.valid && body.invites.length > 0) {
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

  generateInviteObject() {
    const message = this.inviteForm.get('message').value;
    const invites = [];

    // Invitees
    const members = this.inviteForm.get('members')['controls'];
    if (members.length > 0) {
      members.map((member) => {
        const role = member.get('role').value || {};
        const to = member.get('email').value;
        if (to) {
          invites.push({
            to: member.get('email').value,
            accessLevel: member.get('accessLevel').value,
            role,
            message,
          });
        }
      });
    }

    return invites;
  }
}
