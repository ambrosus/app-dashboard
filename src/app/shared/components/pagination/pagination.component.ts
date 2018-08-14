import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  @Input() currentPage;
  @Input() pagination;
  @Input() method: () => any;

  constructor() { }

  ngOnInit() {
  }

}
