import { AssetsResolver } from 'app/services/assets-resolver.service';
import { EventResolver } from 'app/services/event-resolver.service';
import { AssetResolver } from 'app/services/asset-resolver.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssetsRoutingModule } from 'app/modules/assets/assets-routing.module';
import { AssetComponent } from 'app/modules/assets/asset/asset.component';
import { SharedModule } from 'app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AssetsComponent } from 'app/modules/assets/assets/assets.component';
import { AssetAddComponent } from './asset-add/asset-add.component';
import { RouterModule } from '@angular/router';
import { AssetsOutletComponent } from './assets-outlet/assets-outlet.component';
import { EventComponent } from './event/event.component';
import { EventAddComponent } from './event-add/event-add.component';
import { AssetFormComponent } from './forms/asset-form/asset-form.component';
import { EventFormComponent } from './forms/event-form/event-form.component';
import { JsonFormComponent } from './forms/json-form/json-form.component';
import { InterceptorService } from 'app/interceptors/interceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    AssetsRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  declarations: [
    AssetComponent,
    AssetsComponent,
    AssetAddComponent,
    AssetsOutletComponent,
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    },
  ],
})
export class AssetsModule { }
