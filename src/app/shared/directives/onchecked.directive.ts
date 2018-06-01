import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appOnchecked]'
})
export class OncheckedDirective {

  constructor(private el: ElementRef,
              private renderer: Renderer2) { }

  @HostListener('change') onChange() {
    if (this.el.nativeElement.checked) {
      this.renderer.addClass(this.el.nativeElement.parentNode, 'checkbox--checked');
    } else {
      this.renderer.removeClass(this.el.nativeElement.parentNode, 'checkbox--checked');
    }
  }

}
