/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { UsersService } from 'app/services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  navSub: Subscription;
  isLoggedin;
  greeting = 'Hi, welcome!';
  overlay = false;
  users;
  user;
  addAccount;
  sidebar;

  constructor(
    private authService: AuthService,
    private router: Router,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.navSub = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.sidebar = false;
      }
    });

    this.userSub = this.usersService._user.subscribe((res: any) => {
      this.user = res;
      this.greeting = this.user.full_name || this.user.email || 'Hi, welcome!';
      this.isLoggedin = this.authService.isLoggedIn();
    });
  }

  ngOnDestroy() {
    if (this.userSub) { this.userSub.unsubscribe(); }
    if (this.navSub) { this.navSub.unsubscribe(); }
  }

  logout() { this.authService.logout(); }

  checkPermission(routePermissions: string[]): boolean {
    if (!this.user.permissions) {
      return false;
    } else { return routePermissions.every(routePermission => this.user.permissions.some(userPermission => userPermission === routePermission)); }
  }
}
