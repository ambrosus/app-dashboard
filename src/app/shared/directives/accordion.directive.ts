import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appAccordion]'
})
export class AccordionDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click')
  onClick() {
    const title = this.el.nativeElement;
    const content = title.nextElementSibling;
    title.classList.toggle('active');
    content.classList.toggle('active');
  }
}
