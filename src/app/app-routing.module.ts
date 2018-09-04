import { AuthGuardChild } from './services/auth-guard-child.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotfoundComponent } from 'app/core/components/notfound/notfound.component';
import { AuthGuard } from './services/auth-guard.service';
import { AuthGuardLogin } from 'app/services/auth-guard-login.service';
import { HelpComponent } from './core/components/help/help.component';
import { TermsComponent } from './core/components/terms/terms.component';
import { AboutComponent } from './core/components/about/about.component';
import { LoginComponent } from './core/components/login/login.component';
import { SignupComponent } from './core/components/signup/signup.component';
import { HermesregisterComponent } from './core/components/hermesregister/hermesregister.component';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [AuthGuardLogin],
    component: LoginComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'signup',
    canActivate: [AuthGuardLogin],
    component: SignupComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'hermes',
    canActivate: [AuthGuardLogin],
    component: HermesregisterComponent,
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
    canActivateChild: [AuthGuardChild],
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
  { path: 'help', component: HelpComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule],
  providers: [AuthGuard, AuthGuardChild, AuthGuardLogin]
})
export class AppRoutingModule {}
