import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NotfoundComponent } from './notfound/notfound.component';
import {SharedModule} from "../shared/shared.module";
import {AppRoutingModule} from "../app-routing.module";
import {DataStorageService} from "../services/data-storage.service";
import {AuthService} from "../services/auth.service";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {LoaderInterceptor} from "../interceptors/loader-interceptor.service";

@NgModule({
  imports: [
    SharedModule,
    AppRoutingModule
  ],
  exports: [
    AppRoutingModule,
    HeaderComponent,
    FooterComponent
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
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
