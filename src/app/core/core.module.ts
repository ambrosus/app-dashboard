import { NgModule } from '@angular/core';
import { NotfoundComponent } from 'app/core/notfound/notfound.component';
import {SharedModule} from "app/shared/shared.module";
import {AppRoutingModule} from "app/app-routing.module";
import {DataStorageService} from "app/services/data-storage.service";
import {AuthService} from "app/services/auth.service";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {LoaderInterceptor} from "app/interceptors/loader-interceptor.service";

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule
  ],
  exports: [
    AppRoutingModule
  ],
  declarations: [
    NotfoundComponent
  ],
  providers: [
    DataStorageService,
    AuthService,
    // Interceptor is set as a template
    // doesn't do anything right now
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    }
  ]
})
export class CoreModule { }
