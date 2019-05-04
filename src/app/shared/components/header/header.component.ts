/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
import { MessageService } from 'app/services/message.service';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { autocomplete } from 'app/constant';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { AssetsService } from 'app/services/assets.service';
import { StorageService } from 'app/services/storage.service';
import * as moment from 'moment-timezone';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  forms: {
    search?: FormGroup;
  } = {};
  isLoggedin;
  account: any = {};
  advanced = false;
  autocomplete: any[] = autocomplete;
  dropDown: any = {};
  promise: any = {};

  constructor(
    private authService: AuthService,
    private accountsService: AccountsService,
    private router: Router,
    private messageService: MessageService,
    private assetsService: AssetsService,
    private storageService: StorageService,
  ) { }

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

    this.subs[this.subs.length] = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.advanced = false;
      }

      if (e instanceof NavigationEnd) {
        this.isLoggedin = this.authService.isLoggedIn();
        console.log('Is logged in: ', this.isLoggedin);
      }
    });
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  initSearchForm() {
    this.forms.search = new FormGroup({
      name: new FormControl(),
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
        GLN: new FormControl(),
        locationId: new FormControl(),
        lat: new FormControl(),
        lng: new FormControl(),
      }),
    });
  }

  remove(array, index: number) {
    (<FormArray>this.forms.search.get(array)).removeAt(index);
  }

  clear(control) {
    this.forms.search.get(control).setValue('');
  }

  addTag(event, input) {
    let value = event.target.value;

    if (event.keyCode === 13 || event.keyCode === 9) {
      if (value) {
        value = value.trim();
        this.forms.search.get('state')['controls'].push(new FormControl(value));
        input.value = '';
      }
    }
  }

  addIdentifier() {
    this.forms.search.get('identifiers')['controls'].push(
      new FormGroup({
        name: new FormControl(null, []),
        value: new FormControl(null, []),
      }),
    );
  }

  logout() {
    this.assetsService.assets = { clean: true };
    this.assetsService.assetsSearch = { clean: true };
    this.assetsService.initiatedNoAssets = true;
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
    this.promise['search'] = new Promise(async (resolve, reject) => {
      try {
        const form = this.forms.search;
        const data = form.getRawValue();
        const account = <any>this.storageService.get('account') || {};
        data.address = account.address;

        console.log('Form: ', form.valid, form, data);

        if (form.invalid) {
          throw new Error('Form is invalid');
        }

        if (data.from) {
          data.from = moment(data.from).unix();
        }
        if (data.to) {
          data.to = moment(data.to).unix();
        }
        if (data.state.length) {
          data.state.map((type, index) => {
            data.state.splice(index, 1, `ambrosus.asset.${type}`);
            return type;
          });
        }

        this.assetsService.assetsSearch = { clean: true };
        this.assetsService.searchQuery = data;
        const search = await this.assetsService.searchAssets();

        this.router.navigate(['/assets/search']);

        resolve();
      } catch (error) {
        console.error('[SEARCH]: ', error);
        this.messageService.error(error);
        this.assetsService.searchQuery = {};
        reject();
      }
    });
  }
}
