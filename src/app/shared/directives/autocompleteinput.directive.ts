/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Directive({
  selector: '[appAutocompleteinput]',
})
export class AutocompleteinputDirective implements OnInit {
  @Input() appAutocompleteinput: { control: FormControl; array: string[] };
  lastValue: string;
  div = document.createElement('div');

  constructor(
    private el: ElementRef,
  ) { }

  ngOnInit() {
    // Create div to hold autocomplete items
    this.div.setAttribute('class', 'autocomplete');
    // Append div below the input
    this.el.nativeElement.parentNode.appendChild(this.div);
  }

  @HostListener('input')
  onInput() {
    const value = this.el.nativeElement.value;
    if (!value || this.lastValue === value) {
      this.clearList();
      return false;
    }
    this.clearList();
    // Loop through array and add autocomplete items to first div
    for (const item of this.appAutocompleteinput.array) {
      if (item.substr(0, value.length).toUpperCase() === value.toUpperCase()) {
        const b = document.createElement('div');
        b.innerHTML = '<strong>' + item.substr(0, value.length) + '</strong>';
        b.innerHTML += item.substr(value.length);
        b.addEventListener('click', event => {
          this.appAutocompleteinput.control.setValue(item);
          this.lastValue = item;
          this.clearList();
        });
        this.div.appendChild(b);
      }
    }
  }

  clearList() {
    while (this.div.hasChildNodes()) {
      this.div.removeChild(this.div.lastChild);
    }
  }
}
