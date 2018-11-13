/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injectable, ErrorHandler, isDevMode } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './core/core.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SharedModule } from './shared/shared.module';
import {
  DeviceDetectorModule,
  DeviceDetectorService,
} from 'ngx-device-detector';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';
import * as Sentry from '@sentry/browser';

if (!isDevMode) {
  Sentry.init({
    dsn: 'https://3bed4d5c72424dac81458cac8a594789@sentry.io/1319719',
  });
}

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    Sentry.captureException(error.originalError || error);
    throw error;
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CoreModule,
    DashboardModule,
    SharedModule,
    DeviceDetectorModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {
      enabled: environment.production,
    }),
    Angular2PromiseButtonModule.forRoot({
      spinnerTpl: '<span class="btn-spinner"></span>',
      disableBtn: true,
      btnLoadingClass: 'is-loading',
      handleCurrentBtnOnly: false,
    }),
  ],
  providers: [
    DeviceDetectorService,
    { provide: ErrorHandler, useClass: SentryErrorHandler },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
