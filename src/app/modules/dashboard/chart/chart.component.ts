import { Component, OnInit } from '@angular/core';
import * as Chartist from 'chartist';
import { ChartEvent, ChartType } from './chartist/chartist.component';
const data: any = require('./chartData.json');
declare var require: any;

export interface Chart {
  type: ChartType;
  data: Chartist.IChartistData;
  options?: any;
  responsiveOptions?: any;
  events?: ChartEvent;
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  chart1: any = {};
  chart2: any = {};
  chart3: any = {};
  chart4: any = {};

  chart1Toggle: Boolean = false;
  chart2Toggle: Boolean = false;
  chart3Toggle: Boolean = false;
  chart4Toggle: Boolean = false;

  constructor() { }

  ngOnInit() {
    this.chart1['data'] = data.Line;
    this.chart1['type'] = 'Line';

    this.chart2['data'] = data.LineWithArea;
    this.chart2['type'] = 'Line';

    this.chart3['data'] = data.BiPolarBar;
    this.chart3['type'] = 'Bar';

    this.chart4['data'] = data.Pie;
    this.chart4['type'] = 'Pie';
  }

  showChart(number) {
    this.chart1Toggle = false;
    this.chart2Toggle = false;
    this.chart3Toggle = false;
    this.chart4Toggle = false;

    if (number === 1) {
      this.chart1Toggle = true;
    } else if (number === 2) {
      this.chart2Toggle = true;
    } else if (number === 3) {
      this.chart3Toggle = true;
    } else if (number === 4) {
      this.chart4Toggle = true;
    }

  }

}
