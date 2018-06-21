import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {}

  scroll(element: String) {
    const id = `#${element}`;
    const el = this.el.nativeElement.querySelector(id);
    el.scrollIntoView();
  }
}
