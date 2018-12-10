import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AssetsService } from 'app/services/assets.service';

@Component({
  selector: 'app-response-details',
  templateUrl: './response-details.component.html',
  styleUrls: ['./response-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ResponseDetailsComponent implements OnInit {

  stringify = JSON.stringify;

  constructor(
    public assetsService: AssetsService,
  ) { }

  ngOnInit() {
  }
}
