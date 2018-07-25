import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  slug(text) {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }

  scroll(element: String) {
    const id = `#${element}`;
    const el = this.el.nativeElement.querySelector(id);
    el.scrollIntoView();
  }
}
