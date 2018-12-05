import { Component, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { AnalyticsService } from 'app/services/analytics.service';
import { getTimestampSubHours, getTimestamp, getTimestampSubDays, getTimestampSubMonths, getTimestampMonthStart } from 'app/utils/datetime.util';
import { MessageService } from 'app/services/message.service';

declare let Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  display = 'bundle';
  groupBy = '24h';
  diagram: any = {
    element: '',
    canvas: '',
  };
  total = 0;

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
      console.log('[TOTAL]: ', this.total);

      this.diagram.canvas = new Chart(this.diagram.element, {
        type: 'bar',
        data: {
          labels: [this.display, 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [{
            data: [10, 20, 30, 40, 50, 60, 70],
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
