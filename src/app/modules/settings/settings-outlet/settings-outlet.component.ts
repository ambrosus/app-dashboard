/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { StorageService } from 'app/services/storage.service';
import { Subscription } from 'rxjs';
import { AccountsService } from 'app/services/accounts.service';

@Component({
  selector: 'app-settings-outlet',
  templateUrl: './settings-outlet.component.html',
  styleUrls: ['./settings-outlet.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingsOutletComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  account: any = {};

  constructor(
    private storageService: StorageService,
    private accountsService: AccountsService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.subs[this.subs.length] = this.accountsService._account.subscribe(account => this.account = account);
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }
}
