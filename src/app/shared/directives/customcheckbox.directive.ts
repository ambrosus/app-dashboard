import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appCustomCheckbox]'
})
export class CustomCheckboxDirective {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
  }

  @HostListener('change')
  onChange() {
    this.checkboxClicked();
  }

  checkboxClicked() {
    if (this.el.nativeElement.checked) {
      this.renderer.addClass(this.el.nativeElement, 'checkbox--checked');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'checkbox--checked');
    }
  }

}
