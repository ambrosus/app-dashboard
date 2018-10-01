import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
})
export class CompanyComponent implements OnInit {
  sidebar = [
    {
      title: 'Settings',
      link: 'settings',
      icon: 'cog',
    },
  ];

  constructor() { }

  ngOnInit() {
  }
}
