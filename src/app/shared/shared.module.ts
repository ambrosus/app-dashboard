/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { TimelineComponent } from 'app/shared/components/timeline/timeline.component';
import { JsonPreviewComponent } from 'app/shared/components/json-preview/json-preview.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { HttpClientModule } from '@angular/common/http';
import { ClickThisActiveDirective } from './directives/click-this-active.directive';
import { QrCodeComponent } from './components/qr-code/qr-code.component';
import { NotificationComponent } from './components/notification/notification.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EventAddComponent } from './../modules/dashboard/event-add/event-add.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { CheckIfPipe } from './pipes/checkIf.pipe';
import { CustomCheckboxDirective } from './directives/custom-checkbox.directive';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TabsComponent, TabComponent } from './components/tabs/tabs.component';
import { AutofocusDirective } from './directives/auto-focus.directive';

@NgModule({
  imports: [CommonModule, RouterModule, HttpClientModule, MatDialogModule, FormsModule, ImageCropperModule],
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
    TimelineComponent,
    JsonPreviewComponent,
    SvgIconComponent,
    ClickThisActiveDirective,
    QrCodeComponent,
    NotificationComponent,
    MatDialogModule,
    PaginationComponent,
    CheckIfPipe,
    ImageCropperModule,
    CustomCheckboxDirective,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
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
    TimelineComponent,
    JsonPreviewComponent,
    SvgIconComponent,
    ClickThisActiveDirective,
    QrCodeComponent,
    NotificationComponent,
    PaginationComponent,
    CheckIfPipe,
    CustomCheckboxDirective,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
  ],
  entryComponents: [ JsonPreviewComponent, EventAddComponent ],
})
export class SharedModule { }
