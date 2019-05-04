/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

import { TermsComponent } from './core/components/terms/terms.component';
import { LoginComponent } from './core/components/login/login.component';
import { SignupComponent } from './core/components/signup/signup.component';
import { OwnKeyComponent } from './core/components/signup/own-key/own-key.component';
import { GeneratedKeyComponent } from './core/components/signup/generated-key/generated-key.component';
import { RequestComponent } from './core/components/signup/request/request.component';
import { InitialComponent } from './core/components/signup/initial/initial.component';
import { HelpComponent } from './core/components/help/help.component';
import { IntroductionComponent } from './core/components/help/pages/introduction/introduction.component';
import { LoggingIntoTheAccountComponent } from './core/components/help/pages/logging-into-the-account/logging-into-the-account.component';
import { InvitingUsersAndManagingAccountsComponent } from './core/components/help/pages/inviting-users-and-managing-accounts/inviting-users-and-managing-accounts.component';
import { ViewingAndCreatingAssetsComponent } from './core/components/help/pages/viewing-and-creating-assets/viewing-and-creating-assets.component';
import { ViewingAndCreatingEventsComponent } from './core/components/help/pages/viewing-and-creating-events/viewing-and-creating-events.component';
import { SearchingForAssetsComponent } from './core/components/help/pages/searching-for-assets/searching-for-assets.component';
import { ViewingOrganizationStatisticsComponent } from './core/components/help/pages/viewing-organization-statistics/viewing-organization-statistics.component';
import { GettingStartedComponent } from './core/components/help/pages/getting-started/getting-started.component';
import { EditingPersonalAccountSettingsComponent } from './core/components/help/pages/editing-personal-account-settings/editing-personal-account-settings.component';
import { EditingOrganizationDetailsComponent } from './core/components/help/pages/editing-organization-details/editing-organization-details.component';

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
        redirectTo: 'introduction',
      },
      {
        path: 'introduction',
        component: IntroductionComponent,
      },
      {
        path: 'getting-started',
        component: GettingStartedComponent,
      },
      {
        path: 'logging-into-the-account',
        component: LoggingIntoTheAccountComponent,
      },
      {
        path: 'editing-personal-account-settings',
        component: EditingPersonalAccountSettingsComponent,
      },
      {
        path: 'editing-organization-details',
        component: EditingOrganizationDetailsComponent,
      },
      {
        path: 'inviting-users-and-managing-accounts',
        component: InvitingUsersAndManagingAccountsComponent,
      },
      {
        path: 'viewing-and-creating-assets',
        component: ViewingAndCreatingAssetsComponent,
      },
      {
        path: 'viewing-and-creating-events',
        component: ViewingAndCreatingEventsComponent,
      },
      {
        path: 'searching-for-assets',
        component: SearchingForAssetsComponent,
      },
      {
        path: 'viewing-organization-statistics',
        component: ViewingOrganizationStatisticsComponent,
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
    canActivate: [AuthGuard, PermissionsGuard],
    canActivateChild: [AuthGuard, PermissionsGuard],
    loadChildren: 'app/modules/node/node.module#NodeModule',
    runGuardsAndResolvers: 'always',
    data: { permissions: ['super_account'] },
  },
  {
    path: 'organization',
    canActivate: [AuthGuard, PermissionsGuard],
    canActivateChild: [AuthGuard, PermissionsGuard],
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
  providers: [AuthGuard, PermissionsGuard],
})
export class AppRoutingModule { }
