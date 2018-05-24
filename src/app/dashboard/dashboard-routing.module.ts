import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {AssetComponent} from "./asset/asset.component";

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'asset/:id', component: AssetComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
