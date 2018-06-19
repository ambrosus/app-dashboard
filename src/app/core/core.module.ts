import { InterceptorService } from './../interceptors/interceptor.service';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from 'app/core/notfound/notfound.component';
import { SharedModule } from 'app/shared/shared.module';
import { AppRoutingModule } from 'app/app-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  imports: [SharedModule, AppRoutingModule],
  exports: [AppRoutingModule],
  declarations: [NotfoundComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ]
})
export class CoreModule {}
