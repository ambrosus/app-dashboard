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

import { Component, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { AnalyticsService } from 'app/services/analytics.service';
import { getTimestampSubHours, getTimestamp, getTimestampSubDays, getTimestampSubMonths, getTimestampMonthStart } from 'app/util';
import { MessageService } from 'app/services/message.service';
import * as moment from 'moment-timezone';
declare let Web3: any;

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
  timeSeries = {
    labels: [],
    data: [],
  };
  metrics: any = {
    amb: {},
    bundle: {},
    balance: {},
  };
  menus = {
    display: ['bundle', 'asset', 'event'],
    group: ['24h', '7d', 'mtd', '28d', '12m'],
  };
  web3;

  string = String;

  constructor(
    private el: ElementRef,
    private analytisService: AnalyticsService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.web3 = new Web3();
    this.diagram.element = this.el.nativeElement.querySelector('#diagram');
    this.getMetrics();
  }

  formatAMB(val) {
    const BN = this.web3.utils.BN;
    const num = val * Math.pow(10, -18);
    return new BN(num).toString();
  }

  async getMetrics(): Promise<any> {
    try {
      this.metrics.amb = await this.analytisService.amb();
      this.metrics.bundle = await this.analytisService.bundle();
      this.metrics.balance = await this.analytisService.balance();
      this.metrics.balance.balance = this.formatAMB(this.metrics.balance.balance);
    } catch (error) {
      console.error(error);
    }

    console.log(this.metrics);

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
      const total = await this.analytisService.getTimeRangeCount(this.display, start, end);
      this.total = total.count;
      const timeSeries = await this.analytisService.getTimeRangeCountAggregate(this.display, start, end, this.getGroup());
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
