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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AutocompleteinputDirective } from './directives/autocompleteinput.directive';
import { AccordionDirective } from './directives/accordion.directive';
import { StickyDirective } from './directives/sticky.directive';
import { EventsTimelineComponent } from 'app/shared/components/events-timeline/events-timeline.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { HttpClientModule } from '@angular/common/http';
import { QrCodeComponent } from './components/qr-code/qr-code.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EventAddComponent } from './../modules/assets/event-add/event-add.component';
import { CustomCheckboxDirective } from './directives/custom-checkbox.directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatProgressBarModule } from '@angular/material';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AutofocusDirective } from './directives/auto-focus.directive';
import { IconLeftDirective, IconRightDirective } from './directives/icon.directive';
import { ErrorDirective } from './directives/error.directive';
import { DropDownComponent } from './components/drop-down/drop-down.component';
import { ToggleDropDownDirective } from './directives/toggle-drop-down.directive';
import { AgmCoreModule } from '@agm/core';
import { TabsComponent, TabComponent } from './components/tabs/tabs.component';

import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';
import { environment } from 'environments/environment';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { ProgressComponent } from './components/progress/progress.component';

import { ResponseDetailsComponent } from './components/response-details/response-details.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

let apiKey = '';
if (environment.ambrosus) {
  apiKey = 'AIzaSyBSOr58Z_uGBdXIwVi96pkgN5a_ivEkLTg';
}
if (environment.prod) {
  apiKey = 'AIzaSyD8GeDfBs4X8ERrPuGTUsrpTN-y3CgpHks';
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    MatDialogModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey,
    }),
    Angular2PromiseButtonModule.forRoot({
      spinnerTpl: '<span class="spinner"></span>',
      disableBtn: true,
      btnLoadingClass: 'loading',
      handleCurrentBtnOnly: false,
      minDuration: 1000,
    }),
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
  ],
  exports: [
    CommonModule,
    AutocompleteinputDirective,
    AccordionDirective,
    AutofocusDirective,
    StickyDirective,
    EventsTimelineComponent,
    SvgIconComponent,
    QrCodeComponent,
    MatDialogModule,
    CustomCheckboxDirective,
    FooterComponent,
    HeaderComponent,
    IconLeftDirective,
    IconRightDirective,
    ErrorDirective,
    DropDownComponent,
    ToggleDropDownDirective,
    AgmCoreModule,
    TabComponent,
    TabsComponent,
    Angular2PromiseButtonModule,
    ConfirmComponent,
    ProgressComponent,
    SidebarComponent,
    MatProgressBarModule,
  ],
  declarations: [
    AutocompleteinputDirective,
    AutofocusDirective,
    AccordionDirective,
    StickyDirective,
    EventsTimelineComponent,
    SvgIconComponent,
    QrCodeComponent,
    CustomCheckboxDirective,
    FooterComponent,
    HeaderComponent,
    IconLeftDirective,
    IconRightDirective,
    ErrorDirective,
    DropDownComponent,
    ToggleDropDownDirective,
    TabComponent,
    TabsComponent,
    ConfirmComponent,
    ProgressComponent,
    ResponseDetailsComponent,
    SidebarComponent,
  ],
  entryComponents: [
    EventAddComponent,
    ConfirmComponent,
    ProgressComponent,
    ResponseDetailsComponent,
  ],
})
export class SharedModule { }
