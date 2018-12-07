import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-initial',
  templateUrl: './initial.component.html',
  styleUrls: ['./initial.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InitialComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
