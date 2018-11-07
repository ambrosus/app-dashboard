/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { Router, NavigationStart } from '@angular/router';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  accountSub: Subscription;
  navSub: Subscription;
  isLoggedin;
  greeting = 'Hi, welcome!';
  account;
  overlay = false;
  sidebar;

  constructor(
    private authService: AuthService,
    private router: Router,
    private accountsService: AccountsService,
  ) { }

  ngOnInit() {
    this.navSub = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.sidebar = false;
      }
    });

    this.accountSub = this.accountsService._account.subscribe(
      (account: any) => {
        this.account = account;
        this.greeting = account.fullName || account.email || 'Hi, welcome!';
        this.isLoggedin = this.authService.isLoggedIn();
        console.log('[GET] Account (header): ', this.account);
      },
    );
  }

  ngOnDestroy() {
    if (this.accountSub) { this.accountSub.unsubscribe(); }
    if (this.navSub) { this.navSub.unsubscribe(); }
  }

  logout() { this.authService.logout(); }

  checkPermission(routePermissions: string[]): boolean {
    if (!this.account.permissions) {
      return false;
    } else { return routePermissions.every(routePermission => this.account.permissions.some(accountPermission => accountPermission === routePermission)); }
  }
}
