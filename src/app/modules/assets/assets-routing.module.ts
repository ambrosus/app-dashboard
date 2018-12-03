import { AssetResolver } from 'app/services/asset-resolver.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetsComponent } from 'app/modules/assets/assets/assets.component';
import { AssetComponent } from 'app/modules/assets/asset/asset.component';
import { AssetAddComponent } from './asset-add/asset-add.component';
import { AssetsOutletComponent } from './assets-outlet/assets-outlet.component';
import { EventComponent } from './event/event.component';
import { EventAddComponent } from './event-add/event-add.component';
import { EventResolver } from 'app/services/event-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: AssetsOutletComponent,
    children: [
      { path: '', component: AssetsComponent },
      { path: 'new', component: AssetAddComponent },
      {
        path: ':assetid',
        component: AssetComponent,
        resolve: { asset: AssetResolver },
      },
      { path: 'events/new', component: EventAddComponent },
      {
        path: ':assetid/events/:eventid',
        component: EventComponent,
        resolve: { event: EventResolver },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetsRoutingModule { }
