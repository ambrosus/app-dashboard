import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';

@Component({
  selector: 'app-secure-keys',
  templateUrl: './secure-keys.component.html',
  styleUrls: ['./secure-keys.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SecureKeysComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
