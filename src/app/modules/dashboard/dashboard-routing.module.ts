import { AssetResolver } from './../../services/asset-resolver.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetsComponent } from 'app/modules/dashboard/assets/assets.component';
import { AssetComponent } from 'app/modules/dashboard/asset/asset.component';
import { AssetAddComponent } from './asset-add/asset-add.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventComponent } from './event/event.component';
import { EventAddComponent } from './event-add/event-add.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: AssetsComponent },
      { path: 'new', component: AssetAddComponent },
      {
        path: ':assetid',
        component: AssetComponent,
        resolve: { asset: AssetResolver }
      },
      { path: 'events/new', component: EventAddComponent },
      { path: ':assetid/events/:eventid', component: EventComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
