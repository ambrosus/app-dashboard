/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  currentPage = 0;

  @Input() pagination: any;
  @Input() for = 'assets';
  @Input() method: (inputPage) => any;

  constructor() { }

  ngOnInit() {
    this.currentPage = this.pagination.currentPage;
    if (this.for === 'events') { this.currentPage += 1; }
  }

  changePage(value) {
    if (value === 'next') {
      this.pagination.pagination.currentPage += 1;
    } else if (value === 'prev') {
      this.pagination.pagination.currentPage -= 1;
    } else {
      value = parseInt(value.toString().replace(/\D/g, '') || 1, 10) || 1;
      this.pagination.currentPage = value > this.pagination.totalPages ? this.pagination.totalPages : value;
    }

    this.method(this.pagination.currentPage - 1);
  }

}
