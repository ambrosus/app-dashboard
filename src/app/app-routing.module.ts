import { NgModule } from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {NotfoundComponent} from "./core/notfound/notfound.component";
import {AuthGuard} from "./auth/auth-guard.service";
import {AuthGuardLogin} from "./auth/auth-guard-login.service";

const routes: Routes = [
  { path: 'login', canActivate: [AuthGuardLogin], loadChildren: './auth/auth.module#AuthModule' },
  { path: 'dashboard', canActivateChild: [AuthGuard], loadChildren: './dashboard/dashboard.module#DashboardModule' },
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
