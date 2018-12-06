import { Component, OnInit, ElementRef } from '@angular/core';
import { AnalyticsService } from 'app/services/analytics.service';
import { MessageService } from 'app/services/message.service';
import { getTimestampSubHours, getTimestamp, getTimestampSubDays, getTimestampSubMonths, getTimestampMonthStart } from 'app/utils/datetime.util';

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

  constructor(
    private el: ElementRef,
    private analytisService: AnalyticsService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
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

  async generateDiagram(): Promise<any> {
    try {
      const [start, end] = this.getStartEnd();
      const total = await this.analytisService.getTimeRangeCount(this.display, start, end);
      this.total = total.count;
      const timeSeries = await this.analytisService.getTimeRangeCountAggregate(this.display, start, end, this.getGroup());

      this.timeSeries = {
        labels: [],
        data: [],
      };
      timeSeries.count.map(stat => {
        this.timeSeries.labels.unshift(stat.date);
        this.timeSeries.data.unshift(stat.count);
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
    let group = '';

    switch (this.groupBy) {
      case '24h':
        group = 'hour';
        break;
      case '7d':
        group = 'day';
        break;
      case '28d':
        group = 'day';
        break;
      case 'mtd':
        group = 'day';
        break;
      case '12m':
        group = 'month';
        break;
    }

    return group;
  }

  getStartEnd() {
    let start = 0;
    let end = 0;

    switch (this.groupBy) {
      case '24h':
        start = getTimestampSubHours(24);
        end = getTimestamp();
        break;

      case '7d':
        start = getTimestampSubDays(7);
        end = getTimestamp();
        break;

      case 'mtd':
        start = getTimestampMonthStart();
        end = getTimestamp();
        break;

      case '28d':
        start = getTimestampSubDays(28);
        end = getTimestamp();
        break;

      case '12m':
        start = getTimestampSubMonths(12);
        end = getTimestamp();
        break;
    }

    return [start, end];
  }
}
