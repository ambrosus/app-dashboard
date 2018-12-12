import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent implements OnInit {

  @Input() items: any[];

  constructor() { }

  ngOnInit() {
  }

}
