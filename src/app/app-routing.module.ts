import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { AuthLoginGuard } from './guards/auth-login.guard';
import { PermissionsGuard } from './guards/permissions.guard';

import { TermsComponent } from './core/components/terms/terms.component';
import { LoginComponent } from './core/components/login/login.component';
import { SignupComponent } from './core/components/signup/signup.component';
import { OwnKeyComponent } from './core/components/signup/own-key/own-key.component';
import { GeneratedKeyComponent } from './core/components/signup/generated-key/generated-key.component';
import { RequestComponent } from './core/components/signup/request/request.component';
import { InitialComponent } from './core/components/signup/initial/initial.component';
import { HelpComponent } from './core/components/help/help.component';
import { LoginSignupComponent } from './core/components/help/pages/login-signup/login-signup.component';
import { AssetsComponent } from './core/components/help/pages/assets/assets.component';
import { NodeDashboardComponent } from './core/components/help/pages/node-dashboard/node-dashboard.component';
import { OrganizationDashboardComponent } from './core/components/help/pages/organization-dashboard/organization-dashboard.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/login',
  },
  {
    path: 'help',
    component: HelpComponent,
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'assets',
      },
      {
        path: 'assets',
        component: AssetsComponent,
      },
      {
        path: 'authentication',
        component: LoginSignupComponent,
      },
      {
        path: 'node',
        component: NodeDashboardComponent,
      },
      {
        path: 'organization',
        component: OrganizationDashboardComponent,
      },
    ],
  },
  {
    path: 'login',
    canActivate: [AuthGuard],
    component: LoginComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'signup',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: SignupComponent,
    children: [
      {
        path: '',
        component: InitialComponent,
      },
      {
        path: 'own-key',
        component: OwnKeyComponent,
      },
      {
        path: 'generated-key',
        component: GeneratedKeyComponent,
      },
      {
        path: 'request',
        component: RequestComponent,
      },
    ],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'assets',
    canActivate: [AuthGuard],
    loadChildren: 'app/modules/assets/assets.module#AssetsModule',
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'node',
    canActivate: [AuthLoginGuard, PermissionsGuard],
    canActivateChild: [AuthLoginGuard, PermissionsGuard],
    loadChildren: 'app/modules/node/node.module#NodeModule',
    runGuardsAndResolvers: 'always',
    data: { permissions: ['super_account'] },
  },
  {
    path: 'organization',
    canActivate: [AuthLoginGuard, PermissionsGuard],
    canActivateChild: [AuthLoginGuard, PermissionsGuard],
    loadChildren: 'app/modules/organization/organization.module#OrganizationModule',
    runGuardsAndResolvers: 'always',
    data: { permissions: ['manage_accounts'] },
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: 'app/modules/settings/settings.module#SettingsModule',
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'terms',
    component: TermsComponent,
  },
  {
    path: '**',
    redirectTo: '/login',
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
