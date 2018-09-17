import { Component, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material';
import { AddRoleDialogComponent } from './add-role-dialog/add-role-dialog.component';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  rolesSubscription: Subscription;
  roles;

  constructor(public dialog: MatDialog, private http: HttpClient) { }

  ngOnInit() {
    const url = `/api/roles`;

    this.rolesSubscription = this.http.get(url).subscribe(
      (resp: any) => {
        console.log('Roles GET: ', resp);
        this.roles = resp;
      },
      err => {
        console.log('Roles GET error: ', err);
      }
    );
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

  ngOnDestroy() {
    if (this.rolesSubscription) { this.rolesSubscription.unsubscribe(); }
  }

}
