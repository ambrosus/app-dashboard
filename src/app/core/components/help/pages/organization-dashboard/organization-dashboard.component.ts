import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-organization-dashboard',
  templateUrl: './organization-dashboard.component.html',
  styleUrls: ['./organization-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
