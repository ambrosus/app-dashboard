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

  @Input() currentPage: any;
  @Input() totalPages: number;
  @Input() method: (inputPage) => any;

  constructor() { }

  ngOnInit() {
  }

  changePage(value) {

    if (value === 'next') {
      this.currentPage += 1;
    } else if (value === 'prev') {
      this.currentPage -= 1;
    } else {
      value = parseInt(value.toString().replace(/\D/g, '') || 1, 10) || 1;
      this.currentPage = value > this.totalPages ? this.totalPages : value;
    }

    this.method(this.currentPage - 1);
  }

}
