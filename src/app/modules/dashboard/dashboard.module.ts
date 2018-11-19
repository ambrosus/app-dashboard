import { AssetsResolver } from 'app/services/assets-resolver.service';
import { EventResolver } from 'app/services/event-resolver.service';
import { AssetResolver } from 'app/services/asset-resolver.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from 'app/modules/dashboard/dashboard-routing.module';
import { AssetComponent } from 'app/modules/dashboard/asset/asset.component';
import { SharedModule } from 'app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AssetsComponent } from 'app/modules/dashboard/assets/assets.component';
import { AssetAddComponent } from './asset-add/asset-add.component';
import { RouterModule } from '@angular/router';
import { DashboardOutletComponent } from './dashboard-outlet/dashboard-outlet.component';
import { EventComponent } from './event/event.component';
import { EventAddComponent } from './event-add/event-add.component';
import { AssetsService } from 'app/services/assets.service';
import { AssetFormComponent } from './forms/asset-form/asset-form.component';
import { EventFormComponent } from './forms/event-form/event-form.component';
import { JsonFormComponent } from './forms/json-form/json-form.component';
import { InterceptorService } from 'app/interceptors/interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  declarations: [
    AssetComponent,
    AssetsComponent,
    AssetAddComponent,
    DashboardOutletComponent,
    EventComponent,
    EventAddComponent,
    AssetFormComponent,
    EventFormComponent,
    JsonFormComponent,
  ],
  providers: [
    AssetResolver,
    EventResolver,
    AssetsResolver,
    AssetsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    },
  ],
})
export class DashboardModule {}
