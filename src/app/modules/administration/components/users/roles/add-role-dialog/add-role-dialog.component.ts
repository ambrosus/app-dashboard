import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-role-dialog',
  templateUrl: './add-role-dialog.component.html',
  styleUrls: ['./add-role-dialog.component.scss']
})
export class AddRoleDialogComponent implements OnInit {

  spinner: Boolean = false;
  createPromise;

  constructor(private dialogRef: MatDialogRef<AddRoleDialogComponent>) { }

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

}
