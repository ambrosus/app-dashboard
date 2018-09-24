import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AssetsService } from 'app/services/assets.service';

@Directive({
  selector: '[appAutocompleteinput]'
})
export class AutocompleteinputDirective implements OnInit {
  @Input() appAutocompleteinput: { control: FormControl; array: string[] };
  lastValue: string;
  div = document.createElement('div');

  constructor(private el: ElementRef, private assets: AssetsService) { }

  ngOnInit() {
    // Create div to hold autocomplete items
    this.div.setAttribute('class', 'autocomplete-items');
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
          this.el.nativeElement.value = item;
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
