import { Component, OnInit } from '@angular/core';
import * as Chartist from 'chartist';
import { ChartEvent, ChartType } from './chartist/chartist.component';
const data: any = require('./lineData.json');
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

  chart = {};

  constructor() { }

  ngOnInit() {
    this.chart['data'] = data.Line;
    this.chart['type'] = 'Line';
  }

}
