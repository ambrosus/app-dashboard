/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { autocomplete } from 'app/constant';
import { Router, NavigationStart } from '@angular/router';
import { MatDatepicker } from '@angular/material';

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
    searchAdvance?: FormGroup;
  } = {};
  isLoggedin;
  account: any = {};
  advanced = false;
  autocomplete: any[] = autocomplete;
  dropDown: any = {};

  @ViewChild('from') fromDate: MatDatepicker<Date>;

  constructor(
    private authService: AuthService,
    private accountsService: AccountsService,
    private router: Router,
  ) { }

  asd() {
    try {
      console.log(this.fromDate);
      this.fromDate.open();
    } catch (error) {
      console.warn(error);
    }
  }

  ngOnInit() {
    this.subs[this.subs.length] = this.accountsService._account.subscribe(
      account => {
        this.account = account;
        this.isLoggedin = this.authService.isLoggedIn();
        console.log('[GET] Account (header): ', this.account);

        this.logout = this.logout.bind(this);
        this.dropDown.menu = {
          items: [
            {
              type: 'link',
              title: 'Assets',
              link: '/assets',
            },
          ],
        };
        if (this.checkPermissions(['manage_accounts'])) {
          this.dropDown.menu.items.unshift({
            type: 'link',
            title: 'Organization',
            link: '/organization',
          });
        }
        if (this.checkPermissions(['super_account'])) {
          this.dropDown.menu.items.unshift({
            type: 'link',
            title: 'Node',
            link: '/node',
          });
        }

        this.dropDown.profile = {
          title: 'Profile menu',
          items: [
            {
              type: 'header',
              title: this.account.fullName || 'No name',
              meta: this.account.email || this.account.address,
            },
            {
              type: 'separator',
            },
            {
              type: 'link',
              title: 'Settings',
              icon: 'settings',
              link: '/settings',
            },
            {
              type: 'separator',
            },
            {
              type: 'action',
              title: 'Logout',
              icon: 'logout',
              click: this.logout,
              args: [],
            },
          ],
        };
      },
    );

    this.initSearchForm();
    this.initSearchAdvanceForm();

    this.subs[this.subs.length] = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.advanced = false;
      }
    });
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  initSearchForm() {
    this.forms.search = new FormGroup({
      input: new FormControl(),
    });
  }

  initSearchAdvanceForm() {
    this.forms.searchAdvance = new FormGroup({
      input: new FormControl(),
      from: new FormControl(),
      to: new FormControl(),
      state: new FormArray([]),
      identifiers: new FormArray([
        new FormGroup({
          name: new FormControl(),
          value: new FormControl(),
        }),
      ]),
      location: new FormGroup({
        country: new FormControl(),
        city: new FormControl(),
        gln: new FormControl(),
        locationId: new FormControl(),
        lat: new FormControl(),
        lng: new FormControl(),
      }),
    });
  }

  remove(array, index: number) {
    (<FormArray>this.forms.searchAdvance.get(array)).removeAt(index);
  }

  addTag(event, input) {
    let value = event.target.value;

    if (event.keyCode === 13 || event.keyCode === 9) {
      if (value) {
        value = value.trim();
        this.forms.searchAdvance
          .get('state')
        ['controls'].push(new FormControl(value));
        input.value = '';
      }
    }
  }

  addIdentifier() {
    this.forms.searchAdvance.get('identifiers')['controls'].push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  logout() {
    this.authService.logout();
  }

  checkPermissions(routePermissions: string[]): boolean {
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
