import { Component, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material';
import { AddRoleDialogComponent } from './add-role-dialog/add-role-dialog.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  createRoleDialog() {
    const dialogRef = this.dialog.open(AddRoleDialogComponent, {
      width: '600px',
      position: { right: '0'}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}
