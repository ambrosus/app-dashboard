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
import { ImageCropperModule } from 'ngx-image-cropper';
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

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AutofocusDirective } from './directives/auto-focus.directive';
import {
  IconLeftDirective,
  IconRightDirective,
} from './directives/icon.directive';
import { ErrorDirective } from './directives/error.directive';
import { DropDownComponent } from './components/drop-down/drop-down.component';
import { ToggleDropDownDirective } from './directives/toggle-drop-down.directive';
import { AgmCoreModule } from '@agm/core';
import { TabsComponent, TabComponent } from './components/tabs/tabs.component';

import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    MatDialogModule,
    ReactiveFormsModule,
    ImageCropperModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCIf-xvKaHu8pgMCuOgw8Ft9gnMgmAOBVw',
    }),
    Angular2PromiseButtonModule.forRoot({
      spinnerTpl: '<span class="spinner"></span>',
      disableBtn: true,
      btnLoadingClass: 'loading',
      handleCurrentBtnOnly: false,
      minDuration: 1000,
    }),
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
    ImageCropperModule,
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
  ],
  entryComponents: [EventAddComponent],
})
export class SharedModule { }
