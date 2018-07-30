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

}
