import {Directive, ElementRef, HostListener, Input, OnInit, Renderer2} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {AssetsService} from '../../services/assets.service';

@Directive({
  selector: '[appAutocompleteinput]'
})
export class AutocompleteinputDirective implements OnInit {
  @Input('appAutocompleteinput') data: {control: FormControl, array: string[]};
  lastValue: string;
  acDiv = document.createElement('div');

  constructor(private el: ElementRef,
              private renderer: Renderer2,
              private assets: AssetsService) { }

  ngOnInit() {
    // Create div to hold ac items
    this.acDiv.setAttribute('class', 'autocomplete-items');
    // Append div below the input
    this.el.nativeElement.parentNode.appendChild(this.acDiv);
  }

  @HostListener('input') onInput() {
    const value = this.el.nativeElement.value;
    if (!value || this.lastValue === value) {
      this.clearList();
      return false;
    }
    this.clearList();
    // Loop through array and add ac items to first div
    for (const item of this.data.array) {
      if (item.substr(0, value.length).toUpperCase() === value.toUpperCase()) {
        const b = document.createElement('div');
        b.innerHTML = '<strong>' + item.substr(0, value.length) + '</strong>';
        b.innerHTML += item.substr(value.length);
        b.addEventListener('click', (event) => {
          this.el.nativeElement.value = item;
          this.assets.inputChanged.next({control: this.data.control, value: item});
          this.lastValue = item;
          this.clearList();
        });
        this.acDiv.appendChild(b);
      }
    }
  }

  clearList() {
    while (this.acDiv.hasChildNodes()) {
      this.acDiv.removeChild(this.acDiv.lastChild);
    }
  }

}
