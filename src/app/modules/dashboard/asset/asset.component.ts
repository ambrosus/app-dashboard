import { AssetsService } from 'app/services/assets.service';
import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetComponent implements OnInit, AfterViewInit, OnDestroy {
  asset;
  assetId: string;
  createEvents = false;
  jsonEvents;
  json = false;
  events;
  // Test for charts
  private chart: AmChart;
  viewChartTimeline = false;
  sensor;
  chartData = [];
  results = [
    {
      action: 'temperature',
      type: 'temperature',
      name: '25.9 degree Celsius',
      unit: 'degree Celsius',
      value: 25.9,
      author: '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F',
      eventId: '0x881fe88bc48d2eb778dae00a0320aab7bcce291cdd168fe890e3b86d10b4dada',
      timestamp: 1531834228
    },
    {
      action: 'humidity',
      type: 'humidity',
      name: '40.2 percent RH',
      unit: 'percent RH',
      value: 40.2,
      author: '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F',
      eventId: '0x881fe88bc48d2eb778dae00a0320aab7bcce291cdd168fe890e3b86d10b4dada',
      timestamp: 1531834228
    },
    {
      action: 'temperature',
      type: 'temperature',
      name: '25.9 degree Celsius',
      unit: 'degree Celsius',
      value: 25.9,
      author: '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F',
      eventId: '0x881fe88bc48d2eb778dae00a0320aab7bcce291cdd168fe890e3b86d10b4dada',
      timestamp: 1531834528
    },
    {
      action: 'humidity',
      type: 'humidity',
      name: '40.6 percent RH',
      unit: 'percent RH',
      value: 40.6,
      author: '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F',
      eventId: '0x881fe88bc48d2eb778dae00a0320aab7bcce291cdd168fe890e3b86d10b4dada',
      timestamp: 1531834528
    },
    {
      action: 'temperature',
      type: 'temperature',
      name: '25.7 degree Celsius',
      unit: 'degree Celsius',
      value: 25.7,
      author: '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F',
      eventId: '0x881fe88bc48d2eb778dae00a0320aab7bcce291cdd168fe890e3b86d10b4dada',
      timestamp: 1531834828
    },
    {
      action: 'humidity',
      type: 'humidity',
      name: '39.9 percent RH',
      unit: 'percent RH',
      value: 39.9,
      author: '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F',
      eventId: '0x881fe88bc48d2eb778dae00a0320aab7bcce291cdd168fe890e3b86d10b4dada',
      timestamp: 1531834828
    },
    {
      action: 'temperature',
      type: 'temperature',
      name: '25.9 degree Celsius',
      unit: 'degree Celsius',
      value: 25.9,
      author: '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F',
      eventId: '0x881fe88bc48d2eb778dae00a0320aab7bcce291cdd168fe890e3b86d10b4dada',
      timestamp: 1531835128
    },
    {
      action: 'humidity',
      type: 'humidity',
      name: '41 percent RH',
      unit: 'percent RH',
      value: 41,
      author: '0x4d52ffd268B9c5e8157D4b2E89342DdEa161F79F',
      eventId: '0x881fe88bc48d2eb778dae00a0320aab7bcce291cdd168fe890e3b86d10b4dada',
      timestamp: 1531835128
    }
  ];

  objectKeys = Object.keys;
  stringify = JSON.stringify;

  constructor(private route: ActivatedRoute, private assetService: AssetsService, private AmCharts: AmChartsService, private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.asset = data.asset;
      this.events = data.asset.eventsAll;
      this.jsonEvents = data.asset.eventsJSON.results;
      console.log(this.asset);
    });

    this.route.params.subscribe(params => {
      this.assetId = params.assetid;
    });

    // Method to get ambrosus.sensor data if any exists
    // Use specific method for parsing sensor events,
    // loop through all and add value + measurement unit in name property
    this.sensor = this.results;
    this.chartData = this.sensor.reduce((data, obj) => {
      if (obj.type === 'humidity') {
        data.push({
          date: obj.timestamp * 1000,
          value: obj.value
        });
      }
      return data;
    }, []);
    console.log(JSON.stringify(this.chartData, null, 3));
  }

  ngAfterViewInit() {
    if (this.sensor) {
      this.initChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.AmCharts.destroyChart(this.chart);
    }
  }

  initChart() {
    console.log(this.chartData);

    this.chart = this.AmCharts.makeChart('chart', {
      type: 'serial',
      theme: 'light',
      marginTop: 0,
      marginRight: 80,
      dataProvider: this.chartData,
      valueAxes: [
        {
          axisAlpha: 0,
          position: 'left'
        }
      ],
      graphs: [
        {
          id: 'g1',
          balloonText: "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
          bullet: 'round',
          bulletSize: 8,
          lineColor: '#d1655d',
          lineThickness: 2,
          negativeLineColor: '#637bb6',
          type: 'smoothedLine',
          valueField: 'value'
        }
      ],
      chartScrollbar: {
        graph: 'g1',
        gridAlpha: 0,
        color: '#888888',
        scrollbarHeight: 55,
        backgroundAlpha: 0,
        selectedBackgroundAlpha: 0.1,
        selectedBackgroundColor: '#888888',
        graphFillAlpha: 0,
        autoGridCount: true,
        selectedGraphFillAlpha: 0,
        graphLineAlpha: 0.2,
        graphLineColor: '#c2c2c2',
        selectedGraphLineColor: '#888888',
        selectedGraphLineAlpha: 1
      },
      chartCursor: {
        categoryBalloonDateFormat: 'JJ:NN:SS',
        cursorAlpha: 0,
        valueLineEnabled: true,
        valueLineBalloonEnabled: true,
        valueLineAlpha: 0.5,
        fullWidth: true
      },
      dataDateFormat: 'JJ:NN:SS',
      categoryField: 'date',
      categoryAxis: {
        minPeriod: 'ss',
        parseDates: true,
        minorGridAlpha: 0.1,
        minorGridEnabled: true
      },
      export: {
        enabled: true
      }
    });
  }

  isObject(value) {
    return typeof value === 'object';
  }

  syntaxHighlight(json) {
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,

      function(match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }

  valueJSON(value) {
    return value.replace(/["{}\[\]]/g, '').replace(/^\s+/m, '');
  }

  downloadQR(el: any) {
    const data = el.elementRef.nativeElement.children[0].src;
    const filename = `QR_code_${this.assetId}.png`;
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(data, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = data;
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  downloadJSON() {
    const filename = this.asset.info.name || this.asset.timestamp;
    const copy = [];
    this.jsonEvents.map(obj => {
      copy.push(JSON.parse(JSON.stringify(obj)));
    });
    copy.map(obj => {
      obj.content.idData.assetId = '{{assetId}}';
      obj.content.idData.createdBy = '{{userAddress}}';
      delete obj.eventId;
      delete obj.metadata;
      delete obj.content.idData.dataHash;
      delete obj.content.signature;
    });
    const data = this.stringify(copy, null, 3);
    const blob = new Blob([data], { type: 'application/json' });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  openCreateEvent() {
    this.assetService.unselectAssets();
    this.assetService.selectAsset(this.assetId);
    this.createEvents = true;
  }
}
