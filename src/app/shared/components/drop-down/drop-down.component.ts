import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DropDownComponent implements OnInit {
  @Input() items: { title?: string, items: any[] } = {
    items: [],
  };

  constructor() { }

  call(method, args) {
    method.call(...args);
  }

  ngOnInit() {
    console.log(this.items);
  }

}
