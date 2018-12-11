import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IntroductionComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
