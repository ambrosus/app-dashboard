import { AuthGuardChild } from './services/auth-guard-child.service';
import { AuthGuardChildAdmin } from './services/auth-guard-child-admin.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotfoundComponent } from 'app/core/components/notfound/notfound.component';
import { AuthGuard } from './services/auth-guard.service';
import { AuthGuardLogin } from 'app/services/auth-guard-login.service';

import { HelpComponent } from './core/components/help/help.component';
import { TermsComponent } from './core/components/terms/terms.component';
import { AboutComponent } from './core/components/about/about.component';
import { LoginComponent } from './core/components/login/login.component';
import { SetupComponent } from './core/components/setup/setup.component';
import { InviteComponent } from './core/components/invite/invite.component';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [AuthGuardLogin],
    component: LoginComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'setup',
    canActivate: [AuthGuardLogin],
    component: SetupComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'invite/:token',
    component: InviteComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'assets',
    canActivateChild: [AuthGuardChild],
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'administration',
    canActivateChild: [AuthGuardChildAdmin],
    loadChildren: 'app/modules/administration/administration.module#AdministrationModule',
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'settings',
    canActivateChild: [AuthGuardChild],
    loadChildren: 'app/modules/settings/settings.module#SettingsModule',
    runGuardsAndResolvers: 'always'
  },
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  {
    path: 'help', children: [
      {
        path: '**',
        component: HelpComponent
      }
    ]
  },
  { path: 'terms', component: TermsComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule],
  providers: [AuthGuard, AuthGuardChild, AuthGuardChildAdmin, AuthGuardLogin]
})
export class AppRoutingModule { }
