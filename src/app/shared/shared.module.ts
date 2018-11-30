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
import { InputDirective } from 'app/shared/directives/input.directive';
import { RouterModule } from '@angular/router';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SpinnerComponent } from 'app/shared/components/spinner/spinner.component';
import { AssetsLoaderIndicatorComponent } from 'app/shared/components/assets-loader-indicator/assets-loader-indicator.component';
import { AutocompleteinputDirective } from './directives/autocompleteinput.directive';
import { AccordionDirective } from './directives/accordion.directive';
import { StickyDirective } from './directives/sticky.directive';
import { LoopIncludePipe } from './pipes/loop-include.pipe';
import { LoopExcludePipe } from './pipes/loop-exclude.pipe';
import { EventsTimelineComponent } from 'app/shared/components/events-timeline/events-timeline.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { HttpClientModule } from '@angular/common/http';
import { ClickThisActiveDirective } from './directives/click-this-active.directive';
import { QrCodeComponent } from './components/qr-code/qr-code.component';
import { NotificationComponent } from './components/notification/notification.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EventAddComponent } from './../modules/assets/event-add/event-add.component';
import { CheckIfPipe } from './pipes/checkIf.pipe';
import { CustomCheckboxDirective } from './directives/custom-checkbox.directive';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TabsComponent, TabComponent } from './components/tabs/tabs.component';
import { AutofocusDirective } from './directives/auto-focus.directive';
import {
  IconLeftDirective,
  IconRightDirective,
} from './directives/icon.directive';
import { ErrorDirective } from './directives/error.directive';
import { DropDownComponent } from './components/drop-down/drop-down.component';
import { ToggleDropDownDirective } from './directives/toggle-drop-down.directive';
import { AgmCoreModule } from '@agm/core';

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
  ],
  exports: [
    CommonModule,
    InputDirective,
    SpinnerComponent,
    TabsComponent,
    TabComponent,
    AssetsLoaderIndicatorComponent,
    AutocompleteinputDirective,
    AccordionDirective,
    AutofocusDirective,
    StickyDirective,
    LoopIncludePipe,
    LoopExcludePipe,
    EventsTimelineComponent,
    SvgIconComponent,
    ClickThisActiveDirective,
    QrCodeComponent,
    NotificationComponent,
    MatDialogModule,
    CheckIfPipe,
    ImageCropperModule,
    CustomCheckboxDirective,
    FooterComponent,
    SidebarComponent,
    HeaderComponent,
    IconLeftDirective,
    IconRightDirective,
    ErrorDirective,
    DropDownComponent,
    ToggleDropDownDirective,
    AgmCoreModule,
  ],
  declarations: [
    InputDirective,
    SpinnerComponent,
    TabsComponent,
    TabComponent,
    AssetsLoaderIndicatorComponent,
    AutocompleteinputDirective,
    AutofocusDirective,
    AccordionDirective,
    StickyDirective,
    LoopIncludePipe,
    LoopExcludePipe,
    EventsTimelineComponent,
    SvgIconComponent,
    ClickThisActiveDirective,
    QrCodeComponent,
    NotificationComponent,
    CheckIfPipe,
    CustomCheckboxDirective,
    FooterComponent,
    SidebarComponent,
    HeaderComponent,
    IconLeftDirective,
    IconRightDirective,
    ErrorDirective,
    DropDownComponent,
    ToggleDropDownDirective,
  ],
  entryComponents: [EventAddComponent],
})
export class SharedModule { }
