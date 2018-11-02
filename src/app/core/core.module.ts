import { InterceptorService } from 'app/interceptors/interceptor.service';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from 'app/core/components/notfound/notfound.component';
import { SharedModule } from 'app/shared/shared.module';
import { AppRoutingModule } from 'app/app-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TermsComponent } from './components/terms/terms.component';
import { AboutComponent } from './components/about/about.component';
import { HelpComponent } from './components/help/help.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { SetupComponent } from './components/setup/setup.component';
import { Angular2PromiseButtonModule } from 'angular2-promise-buttons';
import { NgSelectModule } from '@ng-select/ng-select';
import { HelpService } from './components/help/help.service';
import { SignupComponent } from './components/signup/signup.component';
import { OrganizationsService } from '../services/organizations.service';

@NgModule({
  imports: [SharedModule, AppRoutingModule, NgSelectModule, ReactiveFormsModule, Angular2PromiseButtonModule.forRoot()],
  exports: [AppRoutingModule],
  declarations: [
    NotfoundComponent,
    TermsComponent,
    AboutComponent,
    HelpComponent,
    LoginComponent,
    SetupComponent,
    SignupComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    },
    HelpService,
    OrganizationsService,
  ],
})
export class CoreModule { }
