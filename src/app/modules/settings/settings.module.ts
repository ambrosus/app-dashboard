/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.io
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsOutletComponent } from './settings-outlet/settings-outlet.component';
import { GeneralComponent } from './general/general.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  declarations: [
    SettingsOutletComponent,
    GeneralComponent,
  ],
})
export class SettingsModule { }
