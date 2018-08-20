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
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventComponent } from './event/event.component';
import { EventAddComponent } from './event-add/event-add.component';
import { StorageService } from 'app/services/storage.service';
import { ChartComponent } from './chart/chart.component';
import { ChartistComponent } from './chart/chartist/chartist.component';
import { AssetsService } from 'app/services/assets.service';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    AssetComponent,
    AssetsComponent,
    AssetAddComponent,
    DashboardComponent,
    EventComponent,
    EventAddComponent,
    ChartComponent,
    ChartistComponent
  ],
  providers: [StorageService, AssetResolver, EventResolver, AssetsResolver, AssetsService]
})
export class DashboardModule {}
