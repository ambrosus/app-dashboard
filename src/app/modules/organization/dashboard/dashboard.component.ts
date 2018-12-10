import { Component, OnInit, ElementRef } from '@angular/core';
import { AnalyticsService } from 'app/services/analytics.service';
import { MessageService } from 'app/services/message.service';
import { getTimestampSubHours, getTimestamp, getTimestampSubDays, getTimestampSubMonths, getTimestampMonthStart } from 'app/util';
import * as moment from 'moment-timezone';
import { StorageService } from 'app/services/storage.service';

declare let Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  display = 'asset';
  groupBy = '24h';
  diagram: any = {
    element: '',
    canvas: '',
  };
  total = 0;
  timeSeries = {
    labels: [],
    data: [],
  };
  account: any = {};

  constructor(
    private el: ElementRef,
    private analytisService: AnalyticsService,
    private messageService: MessageService,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.account = this.storageService.get('account') || {};
    this.diagram.element = this.el.nativeElement.querySelector('#diagram');
    this.generateDiagram();
  }

  changeDisplay(to) {
    this.display = to;
    this.generateDiagram();
  }

  changeGroupBy(to) {
    this.groupBy = to;
    this.generateDiagram();
  }

  format() {
    switch (this.groupBy) {
      case '24h':
        return 'HH';
      case '7d':
        return 'DD-MM';
      case 'mtd':
        return 'DD-MM';
      case '28d':
        return 'DD-MM';
      case '12m':
        return 'MMMM';
      default:
        return 'Y-MM-DD-HH';
    }
  }

  async generateDiagram(): Promise<any> {
    try {
      const [start, end] = this.getStartEnd();
      console.log(start, end);
      const total = await this.analytisService.getTimeRangeCountForOrganization(this.account.organization, this.display, start, end);
      this.total = total.count;
      const timeSeries = await this.analytisService.getTimeRangeCountAggregateForOrganization(this.account.organization, this.display, start, end, this.getGroup());
      console.log('timeSeries: ', timeSeries);

      this.timeSeries = {
        labels: [],
        data: [],
      };
      timeSeries.count.map(stat => {
        this.timeSeries.labels.push(moment(stat.timestamp * 1000).format(this.format()));
        this.timeSeries.data.push(stat.count);
      });
      console.log(this.total, this.timeSeries);

      if (this.diagram.canvas) {
        this.diagram.canvas.destroy();
      }

      this.diagram.canvas = new Chart(this.diagram.element, {
        type: 'bar',
        data: {
          labels: this.timeSeries.labels,
          datasets: [{
            data: this.timeSeries.data,
            backgroundColor: '#bed0ef',
            hoverBackgroundColor: '#bed0ef',
          }],
        },
        options: {
          legend: {
            display: false,
          },
          scales: {
            xAxes: [{
              maxBarThickness: 25,
              gridLines: {
                display: false,
              },
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
              gridLines: {
                display: false,
              },
            }],
          },
        },
      });
    } catch (error) {
      console.log(error);
      this.messageService.error(error);
    }
  }

  getGroup() {
    switch (this.groupBy) {
      case '24h':
        return 'hour';
      case '12m':
        return 'month';
      default:
        return 'day';
    }
  }

  getStartEnd() {
    let start = 0;
    let end = 0;

    switch (this.groupBy) {
      case '24h':
        start = getTimestampSubHours(24);
        break;

      case '7d':
        start = getTimestampSubDays(7);
        break;

      case 'mtd':
        start = getTimestampMonthStart();
        break;

      case '28d':
        start = getTimestampSubDays(28);
        break;

      case '12m':
        start = getTimestampSubMonths(12);
        break;
    }

    end = getTimestamp();

    return [start, end];
  }
}
