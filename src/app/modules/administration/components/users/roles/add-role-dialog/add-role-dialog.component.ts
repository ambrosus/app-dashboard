import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-role-dialog',
  templateUrl: './add-role-dialog.component.html',
  styleUrls: ['./add-role-dialog.component.scss']
})
export class AddRoleDialogComponent {

  spinner: Boolean = false;
  roleForm: FormGroup;
  createPromise;
  title: string;
  permissions: string;
  selectedPermissions: string[] = [];
  error: string;
  successMessage: string;

  permissionsArray = [
    { id: '1', name: 'Invites', value: 'invites' },
    { id: '2', name: 'Users', value: 'users' }
  ]

  constructor(private dialogRef: MatDialogRef<AddRoleDialogComponent>, private http: HttpClient) {
    this.roleForm = new FormGroup({
      title: new FormControl(null, [Validators.required])
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  create(){
    this.error = null;
    this.successMessage = null;
    this.createPromise = new Promise((resolve, reject) => {
      if (this.selectedPermissions.length === 0) { this.error = 'Please select at least one permission'; reject(); }
      else if (!this.roleForm.valid) { this.error = 'Please fill the role title'; reject(); }
      else {
        const body = { 'title': this.roleForm.get('title').value, 'permissions': this.selectedPermissions };
        const url = `/api/roles`;
    
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
      }
    });
  }

  selectPermission(value) {
    if (this.selectedPermissions.indexOf(value) > -1) { this.selectedPermissions = this.selectedPermissions.filter(a => a !== value) } 
    else { this.selectedPermissions.push(value); }
  }

}
