/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-settings-outlet',
  templateUrl: './settings-outlet.component.html',
  styleUrls: ['./settings-outlet.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SettingsOutletComponent implements OnInit {
  account: any = {};

  constructor(
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
  }

}
