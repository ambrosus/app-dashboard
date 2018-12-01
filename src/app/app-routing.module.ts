import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { TermsComponent } from './core/components/terms/terms.component';
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
    component: SignupComponent,
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
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload' }),
  ],
  exports: [RouterModule],
  providers: [AuthGuard, AuthLoginGuard, PermissionsGuard],
})
export class AppRoutingModule { }
