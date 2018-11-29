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
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { autocomplete } from 'app/constant';

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
  advancedSearch;
  autocomplete: any[] = autocomplete;
  dropDownItems: any = {};

  constructor(
    private authService: AuthService,
    private accountsService: AccountsService,
  ) { }

  ngOnInit() {
    this.subs[this.subs.length] = this.accountsService._account.subscribe(
      account => {
        this.account = account;
        this.isLoggedin = this.authService.isLoggedIn();
        console.log('[GET] Account (header): ', this.account);

        this.logout = this.logout.bind(this);
        this.dropDownItems = {
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
            },
          ],
        };
      },
    );

    this.initSearchForm();
    this.initSearchAdvanceForm();
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
