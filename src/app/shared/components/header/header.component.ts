/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  forms: {
    search?: FormGroup;
  } = {};
  isLoggedin;
  account;

  constructor(
    private authService: AuthService,
    private accountsService: AccountsService,
  ) {}

  ngOnInit() {
    this.subs[this.subs.length] = this.accountsService._account.subscribe(
      account => {
        this.account = account;
        this.isLoggedin = this.authService.isLoggedIn();
        console.log('[GET] Account (header): ', this.account);
      },
    );

    this.initSearchForm();
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  initSearchForm() {
    this.forms.search = new FormGroup({
      input: new FormControl(null, [Validators.required]),
    });
  }

  logout() {
    this.authService.logout();
  }

  checkPermission(routePermissions: string[]): boolean {
    if (!this.account.permissions) {
      return false;
    } else {
      return routePermissions.every(routePermission =>
        this.account.permissions.some(
          accountPermission => accountPermission === routePermission,
        ),
      );
    }
  }

  search() {
    console.log('Searching...');
  }
}
