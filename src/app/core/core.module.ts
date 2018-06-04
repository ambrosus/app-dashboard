import { NgModule } from '@angular/core';
import { NotfoundComponent } from 'app/core/notfound/notfound.component';
import {SharedModule} from "app/shared/shared.module";
import {AppRoutingModule} from "app/app-routing.module";
import {AuthService} from "app/services/auth.service";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {InterceptorService} from "app/interceptors/interceptor.service";

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
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ]
})
export class CoreModule { }
