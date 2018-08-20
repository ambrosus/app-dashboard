import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  @Input() currentPage;
  @Input() pagination;
  @Input() method: (inputPage) => any;
  inputPage: any;

  constructor() { }

  ngOnInit() {
    this.inputPage = this.currentPage;
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
        // invalid character, prevent input
        event.preventDefault();
    }
  }

  pageValue(event: any) {
    console.log(event.target.value);
    this.inputPage = event.target.value;
    this.method(this.inputPage);
  }

}
