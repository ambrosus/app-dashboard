import { AssetsService } from './../../../services/assets.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss']
})
export class AssetComponent implements OnInit {
  assetId: string;
  createEvents = false;

  constructor(
    private route: ActivatedRoute,
    private assetService: AssetsService
  ) {}

  openCreateEvent() {
    this.assetService.unselectAssets();
    this.assetService.selectAsset(this.assetId);
    this.createEvents = true;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.assetId = params.assetid;
    });
  }
}
