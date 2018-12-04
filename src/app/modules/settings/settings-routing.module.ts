import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsOutletComponent } from './settings-outlet/settings-outlet.component';
import { GeneralComponent } from './general/general.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsOutletComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: GeneralComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule { }
