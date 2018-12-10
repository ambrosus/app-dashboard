import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-node-outlet',
  templateUrl: './node-outlet.component.html',
  styleUrls: ['./node-outlet.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NodeOutletComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
