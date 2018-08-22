import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { LoginComponent } from 'app/core/components/login/login.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {
  isLoggedin = false;
  greeting = 'Hi, welcome!';
  overlay = false;
  users;
  user;
  addAccount;

  constructor(
    private auth: AuthService,
    private storage: StorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.headerInit();
    window.addEventListener('user:login', () => {
      this.headerInit();
    });
  }

  headerInit() {
    this.user = this.storage.get('user') || {};
    this.greeting = this.user.full_name || this.user.email || 'Hi, welcome!';
    this.isLoggedin = <any>this.storage.get('isLoggedin');
    this.users = this.storage.get('accounts') || [];
    this.dialog.closeAll();
  }

  switchAccount(address) {
    this.auth.switchAccount(address);
  }

  logout() {
    this.auth.logout();
  }

  logoutAll() {
    this.auth.logoutAll();
  }

  addAccountDialog() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '600px',
      position: { right: '0'}
    });
    const instance = dialogRef.componentInstance;
    instance.isDialog = true;

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
