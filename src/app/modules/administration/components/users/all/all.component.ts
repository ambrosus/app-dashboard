import { Component, OnInit, ElementRef } from '@angular/core';
import { AdministrationService } from 'app/services/administration.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss']
})
export class AllComponent implements OnInit {
  selectAllText = 'Select all';
  members = [
    {
      full_name: 'Roman Šabanov',
      email: 'roman@test.com',
      role: 'Team leader',
      _id: '123'
    },
    {
      full_name: 'Lazar Eric',
      email: 'lazar@test.com',
      role: 'Employee',
      _id: '1234'
    },
    {
      full_name: 'Meet Dave',
      email: 'meet@test.com',
      role: 'Employee',
      _id: '1235'
    }
  ];

  constructor(private el: ElementRef, private administration: AdministrationService) { }

  ngOnInit() {
  }

  onSelectAll(e, input) {
    let table = this.el.nativeElement.querySelectorAll('.table__item.table');
    table = Array.from(table);
    if (input.checked) {
      this.selectAllText = 'Unselect all';
      table.map((item) => {
        const checkbox = item.children[0].children[0].children[0];
        checkbox.checked = true;
        this.administration.selectUser(checkbox.name);
      });
      this.administration.toggleSelect.next('true');
    } else {
      this.selectAllText = 'Select all';
      table.map((item) => {
        const checkbox = item.children[0].children[0].children[0];
        checkbox.checked = false;
      });
      this.administration.unselectUsers();
      this.administration.toggleSelect.next('true');
    }
  }
}
