import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'app/services/storage.service';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { InviteService } from 'app/services/invite.service';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss'],
})
export class InviteComponent implements OnInit, OnDestroy {
  inviteForm: FormGroup;
  spinner = false;
  error;
  success;
  roles = [];
  getRolesSub: Subscription;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private authService: AuthService,
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
  }

  getRoles() {
    // Get roles
    const url = `/api/users/roles`;

    this.getRolesSub = this.http.get(url).subscribe(
      (resp: any) => {
        console.log('Roles GET: ', resp);
        this.roles = resp.data;
      },
      err => {
        if (err.status === 401) { this.authService.logout(); }
        console.log('Roles GET error: ', err);
      }
    );
  }

  // Methods for adding/removing new fields to the form
  remove(array, index: number) {
    (<FormArray>this.inviteForm.get(array)).removeAt(index);
  }

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

      this.inviteService.sendInvite(body).subscribe(
        (resp: any) => {
          this.spinner = false;
          this.success = 'Invites sent';
        },
        err => {
          if (err.status === 401) { this.authService.logout(); }
          console.log('Invites error: ', err);
          this.error = 'Invites failed';
        }
      );
    } else {
      this.error = 'Need at least one invite';
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
