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
  profile_image;
  addAccount;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.headerInit();
    window.addEventListener('user:refresh', () => {
      this.headerInit();
    });
  }

  headerInit() {
    this.user = this.storageService.get('user') || {};
    this.greeting = this.user.full_name || this.user.email || 'Hi, welcome!';
    this.profile_image = '';

    if (this.user && this.user.profile && this.user.profile.image) {
      this.profile_image = this.sanitizer.bypassSecurityTrustStyle(`url(${this.user.profile.image || ''})`);
    }

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
      height: '100vh',
    });

    dialogRef.afterClosed().subscribe(result => console.log('The dialog was closed'));
  }
}
