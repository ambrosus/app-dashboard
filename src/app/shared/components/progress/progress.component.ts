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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ResponseDetailsComponent } from '../response-details/response-details.component';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProgressComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  title = '';
  value = 0.1;
  results = false;
  dialogs: {
    moreDetails?: MatDialogRef<any>,
  } = {};
  minimized = false;

  constructor(
    public assetsService: AssetsService,
    private dialog: MatDialog,
  ) {
    if (window.innerWidth < 768) {
      this.minimized = true;
    }

    this.subs[this.subs.length] = this.assetsService.progress.status.asset.subscribe(
      resp => {
        console.log('AS Inc spinner value: ', 100 / this.assetsService.progress.creating);
        this.value += 100 / this.assetsService.progress.creating;
      },
    );

    this.subs[this.subs.length] = this.assetsService.progress.status.event.subscribe(
      resp => {
        console.log('ES Inc spinner value: ', 100 / this.assetsService.progress.creating);
        this.value += 100 / this.assetsService.progress.creating;
      },
    );

    this.subs[this.subs.length] = this.assetsService.progress.status.done.subscribe(
      resp => {
        console.log('Inc done: ', 100);
        this.value = 100;
        setTimeout(() => {
          this.results = true;
        }, 1000);
      },
      error => {
        console.log('Inc done: ', 100);
        this.value = 100;
        setTimeout(() => {
          this.results = true;
        }, 1000);
      },
    );
  }

  toggleMinimize() {
    setTimeout(() => {
      this.minimized = !this.minimized;
    }, 300);
  }

  ngOnInit() {
    this.title = this.assetsService.progress.title;
    console.log('Progress title: ', this.title);
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  moreDetails() {
    this.dialogs.moreDetails = this.dialog.open(ResponseDetailsComponent, {
      panelClass: 'responseDetails',
    });

    this.dialogs.moreDetails.afterClosed().subscribe(result => {
      console.log('Response details closed', result);
    });
  }
}
