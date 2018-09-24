import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { RoleDialogComponent } from './role-dialog/role-dialog.component';
import { HttpClient } from '@angular/common/http';
import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  constructor(public dialog: MatDialog, private http: HttpClient, private _users: UsersService) { }

  ngOnInit() { }

  openRoleDialog(role) {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '600px',
      position: { right: '0' },
      data: { role }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  deleteRole({ _id }) {
    this._users.deleteRole(_id);
  }

}
