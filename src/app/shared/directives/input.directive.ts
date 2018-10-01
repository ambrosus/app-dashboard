import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appInput]',
})
export class InputDirective {

  constructor(private el: ElementRef,
              private renderer: Renderer2) {}

  @HostListener('focus') onFocus() {
    this.renderer.addClass(this.el.nativeElement.parentNode, 'active');
    this.renderer.addClass(this.el.nativeElement.parentNode, 'full');
  }

  @HostListener('focusout') onFocusOut() {
    this.renderer.removeClass(this.el.nativeElement.parentNode, 'active');
    if (this.el.nativeElement.value === '') {
      this.renderer.removeClass(this.el.nativeElement.parentNode, 'full');
    }
  }

}
