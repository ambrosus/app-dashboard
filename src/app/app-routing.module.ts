import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotfoundComponent } from 'app/core/components/notfound/notfound.component';
import { AuthGuard } from 'app/modules/auth/auth-guard.service';
import { AuthGuardLogin } from 'app/modules/auth/auth-guard-login.service';
import { HelpComponent } from './core/components/help/help.component';
import { TermsComponent } from './core/components/terms/terms.component';
import { AboutComponent } from './core/components/about/about.component';
import { SettingsComponent } from './core/components/settings/settings.component';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [AuthGuardLogin],
    loadChildren: 'app/modules/auth/auth.module#AuthModule',
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'assets',
    canActivateChild: [AuthGuard],
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
    runGuardsAndResolvers: 'always'
  },
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: 'help', component: HelpComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' })
  ],
  exports: [RouterModule],
  providers: [AuthGuard, AuthGuardLogin]
})
export class AppRoutingModule {}
