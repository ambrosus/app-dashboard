import { InterceptorService } from './../interceptors/interceptor.service';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from 'app/core/components/notfound/notfound.component';
import { SharedModule } from 'app/shared/shared.module';
import { AppRoutingModule } from 'app/app-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TermsComponent } from './components/terms/terms.component';
import { AboutComponent } from './components/about/about.component';
import { HelpComponent } from './components/help/help.component';

@NgModule({
  imports: [SharedModule, AppRoutingModule],
  exports: [AppRoutingModule],
  declarations: [NotfoundComponent, TermsComponent, AboutComponent, HelpComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ]
})
export class CoreModule {}
