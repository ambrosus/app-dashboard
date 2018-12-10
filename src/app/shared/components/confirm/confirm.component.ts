import { Component, OnInit, Input, Inject } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConfirmComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    console.log('Confirm content: ', this.data);
  }

}
