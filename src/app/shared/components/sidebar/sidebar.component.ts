import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

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

  slug(text) {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }
}
