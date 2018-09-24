import { Component, Input, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material';

import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'app-role-dialog',
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.scss']
})
export class RoleDialogComponent implements OnInit {

  createPromise;

  title: string;
  _id: string;

  message;

  permissions: any = [
    { title: 'Invites', value: 'invites' },
    { title: 'Users', value: 'users' },
    { title: 'Roles', value: 'roles' }
  ];

  @Input() roleObj;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<RoleDialogComponent>,
    private _users: UsersService) { }

  ngOnInit() {
    if (this.data.role) {
      this.title = this.data.role.title;
      this._id = this.data.role._id;

      this.permissions = this.permissions.map(p => {
        if (this.data.role.permissions.indexOf(p.value) > -1) {
          p.checked = true
        };
        return p;

      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  save() {

    this.message = null;

    const data: any = {
      title: this.title,
      permissions: this.permissions.filter(p => p.checked).map(p => p.value)
    }

    if (!/^[a-zA-Z\s]*$/.test(data.title)) { // Allow only letters and spaces
      this.message = {
        type: 'error',
        text: 'Title is incorrect.'
      }
      return false;
    }

    if (!data.permissions.length) {
      this.message = {
        type: 'error',
        text: 'No permissions selected.'
      }
      return false;
    }

    if (this._id) {
      this.createPromise = new Promise((resolve, reject) => {
        this._users.updateRole(this._id, data)
          .subscribe((role) => resolve());
      });
    } else {
      this.createPromise = new Promise((resolve, reject) => {
        this._users.createRole(data)
          .subscribe((role) => resolve());
      });
    }

  }
}
