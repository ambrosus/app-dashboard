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

import { AssetResolver } from 'app/guards/asset-resolver.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetsComponent } from 'app/modules/assets/assets/assets.component';
import { AssetComponent } from 'app/modules/assets/asset/asset.component';
import { AssetsOutletComponent } from './assets-outlet/assets-outlet.component';
import { EventComponent } from './event/event.component';
import { EventResolver } from 'app/guards/event-resolver.service';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    component: AssetsOutletComponent,
    children: [
      { path: '', component: AssetsComponent },
      { path: 'search', component: SearchComponent },
      {
        path: ':assetid',
        component: AssetComponent,
        resolve: { asset: AssetResolver },
      },
      {
        path: ':assetid/events/:eventid',
        component: EventComponent,
        resolve: { event: EventResolver },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetsRoutingModule { }
