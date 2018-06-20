import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appAccordion]'
})
export class AccordionDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click')
  onClick() {
    const nextSibling = this.el.nativeElement.nextElementSibling;
    if (!nextSibling.classList.contains('active')) {
      this.renderer.addClass(nextSibling, 'active');
    } else {
      this.renderer.removeClass(nextSibling, 'active');
    }
  }
}
