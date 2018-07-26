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
export class AssetComponent implements OnInit {
  asset;
  assetId: string;
  createEvents = false;
  jsonEvents;
  json = false;
  events;

  objectKeys = Object.keys;

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
  }

  isObject(value) {
    return typeof value === 'object';
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

  openCreateEvent() {
    this.assetService.unselectAssets();
    this.assetService.selectAsset(this.assetId);
    this.createEvents = true;
  }
}
