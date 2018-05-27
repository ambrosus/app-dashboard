import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AssetsComponent} from "app/modules/dashboard/assets/assets.component";
import {AssetComponent} from "app/modules/dashboard/asset/asset.component";
import {AssetAddComponent} from "./asset-add/asset-add.component";
import {DashboardComponent} from "./dashboard/dashboard.component";

const routes: Routes = [
  { path: '', component: DashboardComponent, children: [
      { path: '', component: AssetsComponent },
      { path: 'new', component: AssetAddComponent },
      { path: ':id', component: AssetComponent }
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
