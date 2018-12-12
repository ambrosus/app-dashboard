import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-node-dashboard',
  templateUrl: './node-dashboard.component.html',
  styleUrls: ['./node-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NodeDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
