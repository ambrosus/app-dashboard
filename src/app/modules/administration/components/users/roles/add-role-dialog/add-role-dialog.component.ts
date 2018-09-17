import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-role-dialog',
  templateUrl: './add-role-dialog.component.html',
  styleUrls: ['./add-role-dialog.component.scss']
})
export class AddRoleDialogComponent implements OnInit {

  spinner: Boolean = false;
  createPromise;
  title: string;
  permissions: string;
  selectedPermissions: string[] = [];
  error: string;
  successMessage: string;
  isEdit: Boolean = false;

  permissionsArray = [
    { id: '1', name: 'Invites', value: 'invites' },
    { id: '2', name: 'Users', value: 'users' },
    { id: '3', name: 'Roles', value: 'roles' }
  ];

  @Input() roleObj;

  constructor(private dialogRef: MatDialogRef<AddRoleDialogComponent>, private http: HttpClient) { }

  ngOnInit() {
    if (this.roleObj) { this.getRoleById(this.roleObj[0]); this.isEdit = true; }
  }

  getRoleById(role) {
    this.selectedPermissions = role.permissions;
    this.title = role.title;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  create() {
    this.error = null;
    this.successMessage = null;

    this.createPromise = new Promise((resolve, reject) => {
      if (this.selectedPermissions.length === 0) { this.error = 'Please select at least one permission'; reject(); } 
      else if (!this.title) { this.error = 'Please fill the role title'; reject(); } 
      else if (!this.isEdit) {
        const url = `/api/roles`;
        const body = { title: this.title, permissions: this.selectedPermissions };
        this.http.post(url, body).subscribe(
          (resp: any) => {
            this.successMessage = 'New role created successfully!';
            resolve();
          },
          err => {
            reject();
            this.error = err.error ? err.error.message : JSON.stringify(err);
            console.log('Role save failed: ', err);
        });

      } else if (this.isEdit) {
        console.log('GHA');
        const url = `/api/roles/${this.roleObj[0]._id}`;
        const body = { title: this.title, permissions: this.selectedPermissions };
        this.http.put(url, body).subscribe(
          (resp: any) => {
            this.successMessage = 'Permissions edited successfully!';
            resolve();
          },
          err => {
            reject();
            this.error = err.error ? err.error.message : JSON.stringify(err);
            console.log('Role save failed: ', err);
        });
      }
    });

  }

  selectPermission(value) {
    if (this.selectedPermissions.indexOf(value) > -1) { this.selectedPermissions = this.selectedPermissions.filter(a => a !== value); } 
    else { this.selectedPermissions.push(value); }
  }

  checkPermission(value) {
    if (this.selectedPermissions.indexOf(value) > -1) { return true; }
    else { return false; }
  }

}
