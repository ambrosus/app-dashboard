/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.io
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { InterceptorService } from 'app/interceptors/interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, ErrorHandler } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from './core/core.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SharedModule } from './shared/shared.module';
import * as Sentry from '@sentry/browser';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { ErrorHandlerService } from './services/error-handler.service';
const { ambrosus, test, prod } = environment;
import { AgmCoreModule } from '@agm/core';

let env = 'test';
if (test) { env = 'test'; }
if (prod) { env = 'prod'; }

if (ambrosus) {
  Sentry.init({
    dsn: 'https://3bed4d5c72424dac81458cac8a594789@sentry.io/1319719',
    environment: env,
  });
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CoreModule,
    AssetsModule,
    SharedModule,
    ServiceWorkerModule.register('/dashboard/ngsw-worker.js', {
      enabled: environment.production,
    }),
    MatSnackBarModule,
    AgmCoreModule.forRoot({
      apiKey: 'your key',
      libraries: ['places'],
    }),
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 3000,
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
