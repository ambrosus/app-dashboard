import { AssetResolver } from 'app/guards/asset-resolver.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetsComponent } from 'app/modules/assets/assets/assets.component';
import { AssetComponent } from 'app/modules/assets/asset/asset.component';
import { AssetsOutletComponent } from './assets-outlet/assets-outlet.component';
import { EventComponent } from './event/event.component';
import { EventResolver } from 'app/guards/event-resolver.service';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    component: AssetsOutletComponent,
    children: [
      { path: '', component: AssetsComponent },
      { path: 'search', component: SearchComponent },
      {
        path: ':assetid',
        component: AssetComponent,
        resolve: { asset: AssetResolver },
      },
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
