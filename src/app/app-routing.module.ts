import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {NotfoundComponent} from "app/core/notfound/notfound.component";
import {AuthGuard} from "app/modules/auth/auth-guard.service";
import {AuthGuardLogin} from "app/modules/auth/auth-guard-login.service";

const routes: Routes = [
  { path: 'login', canActivate: [AuthGuardLogin], loadChildren: 'app/modules/auth/auth.module#AuthModule' },
  { path: 'assets', canActivateChild: [AuthGuard], loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule' },
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    AuthGuardLogin
  ]
})
export class AppRoutingModule { }
