import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appAccordion]'
})
export class AccordionDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click')
  onClick() {
    const element = this.el.nativeElement;
    const nextSibling = this.el.nativeElement.nextElementSibling;
    if (!nextSibling.classList.contains('active')) {
      this.renderer.addClass(nextSibling, 'active');
      this.renderer.addClass(element, 'active');
    } else {
      this.renderer.removeClass(nextSibling, 'active');
      this.renderer.removeClass(element, 'active');
    }
  }
}
