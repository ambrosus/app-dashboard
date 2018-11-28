import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appClickThisActive]',
})
export class ClickThisActiveDirective {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  @HostListener('click') onClick() {
    const hasClass = this.el.nativeElement.classList.contains('active');

    this.renderer[hasClass ? 'removeClass' : 'addClass'](this.el.nativeElement, 'active');
  }

}
