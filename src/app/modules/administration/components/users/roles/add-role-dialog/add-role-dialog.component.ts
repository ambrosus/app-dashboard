import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-role-dialog',
  templateUrl: './add-role-dialog.component.html',
  styleUrls: ['./add-role-dialog.component.scss']
})
export class AddRoleDialogComponent implements OnInit {

  spinner: Boolean = false;
  roleForm: FormGroup;
  createPromise;
  title: string;
  permissions: string;

  permissionsArray = [
    { id: '1', name: 'Invites', value: 'invites' },
    { id: '2', name: 'Users', value: 'users' }
  ]

  constructor(private dialogRef: MatDialogRef<AddRoleDialogComponent>) {
    this.roleForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      permissions: new FormControl(null, [Validators.required])
    });
  }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

  create(){
    this.createPromise = new Promise((resolve, reject) => {
      setTimeout(reject, 2000);
    });
  }

  addRole() {
    console.log('Add Role');
  }

  selectPermission(id) {
    console.log(id);
  }

}
