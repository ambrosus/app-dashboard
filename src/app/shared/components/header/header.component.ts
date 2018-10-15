/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { StorageService } from 'app/services/storage.service';
import { LoginComponent } from 'app/core/components/login/login.component';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class HeaderComponent implements OnInit {
  isLoggedin;
  greeting = 'Hi, welcome!';
  overlay = false;
  users;
  user;
  addAccount;
  sidebar;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router
  ) { }

  ngOnInit() {
    this.headerInit();
    window.addEventListener('user:refresh', () => {
      this.headerInit();
    });
    this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.sidebar = false;
      }
    });
  }

  headerInit() {
    this.user = this.storageService.get('user') || {};
    this.greeting = this.user.full_name || this.user.email || 'Hi, welcome!';
    this.isLoggedin = this.authService.isLoggedIn();
    this.users = this.storageService.get('accounts') || [];
    this.dialog.closeAll();
  }

  switchAccount(address) { this.authService.switchAccount(address); }

  logout() { this.authService.logout(); }

  logoutAll() { this.authService.logoutAll(); }

  addAccountDialog() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '600px',
      position: { right: '0' },
    });
    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }

  checkPermission(routePermission: string[]): boolean {
    return routePermission.every(route_permission => this.user.permissions.some(user_permission => user_permission === route_permission));
  }
}
