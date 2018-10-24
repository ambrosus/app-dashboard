import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { NotfoundComponent } from 'app/core/components/notfound/notfound.component';

import { HelpComponent } from './core/components/help/help.component';
import { TermsComponent } from './core/components/terms/terms.component';
import { AboutComponent } from './core/components/about/about.component';
import { LoginComponent } from './core/components/login/login.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AuthLoginGuard } from './guards/auth-login.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { SignupComponent } from './core/components/signup/signup.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/login',
  }, {
    path: 'login',
    canActivate: [AuthGuard],
    component: LoginComponent,
    runGuardsAndResolvers: 'always',
  }, {
    path: 'signup',
    canActivate: [AuthGuard],
    component: SignupComponent,
    runGuardsAndResolvers: 'always',
  }, {
    path: 'assets',
    canActivate: [AuthGuard],
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
    runGuardsAndResolvers: 'always',
  }, {
    path: 'organization',
    canActivate: [AuthLoginGuard, PermissionsGuard],
    canActivateChild: [AuthLoginGuard, PermissionsGuard],
    loadChildren: 'app/modules/organization/organization.module#OrganizationModule',
    runGuardsAndResolvers: 'always',
    data: { permissions: ['manage_organization'] },
  }, {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: 'app/modules/settings/settings.module#SettingsModule',
    runGuardsAndResolvers: 'always',
  }, {
    path: 'help',
    children: [{
      path: '**',
      component: HelpComponent,
    }],
  }, {
    path: 'terms',
    component: TermsComponent,
  }, {
    path: 'about',
    component: AboutComponent,
  }, {
    path: '**',
    component: NotfoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' }),
  ],
  exports: [RouterModule],
  providers: [AuthGuard, AuthLoginGuard, PermissionsGuard],
})
export class AppRoutingModule { }
