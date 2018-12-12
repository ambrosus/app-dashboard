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

  constructor(
    public assetsService: AssetsService,
    private dialog: MatDialog,
  ) {
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
