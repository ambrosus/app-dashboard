import { Directive, ElementRef, HostListener, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appCustomCheckbox]',
})
export class CustomCheckboxDirective implements OnInit {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
  }

  ngOnInit() {
    const checkBoxIcon = this.renderer.createElement('span');

    this.renderer.addClass(this.el.nativeElement, 'custom_checkbox');
    this.renderer.addClass(checkBoxIcon, 'custom_checkbox__icon');

    this.el.nativeElement.parentNode.insertBefore(checkBoxIcon, this.el.nativeElement.nextSibling);
  }

}
