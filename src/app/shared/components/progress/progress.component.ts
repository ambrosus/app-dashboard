import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AssetsService } from 'app/services/assets.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
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
  value = 0;
  results = false;

  constructor(
    public assetsService: AssetsService,
    private dialog: MatDialog,
  ) {
    this.subs[this.subs.length] = this.assetsService.progress.status.asset.subscribe(
      resp => this.value += Math.floor(100 / this.assetsService.progress.creating),
      error => this.value += Math.floor(100 / this.assetsService.progress.creating),
    );
    this.subs[this.subs.length] = this.assetsService.progress.status.event.subscribe(
      resp => this.value += Math.floor(100 / this.assetsService.progress.creating),
      error => this.value += Math.floor(100 / this.assetsService.progress.creating),
    );
    this.subs[this.subs.length] = this.assetsService.progress.status.done.subscribe(
      resp => {
        this.value = 100;
        setTimeout(() => {
          this.results = true;
        }, 1000);
      },
      error => {
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
    const dialogRef = this.dialog.open(ResponseDetailsComponent, {
      panelClass: 'responseDetails',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Response details closed', result);
    });
  }
}
