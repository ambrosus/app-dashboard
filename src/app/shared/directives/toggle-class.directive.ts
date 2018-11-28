import { Directive, Input, Renderer2, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appToggleClass]',
})
export class ToggleClassDirective {

  @Input() appToggleClass = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  @HostListener('click') onClick() {
    const hasClass = this.el.nativeElement.classList.contains(this.appToggleClass);

    this.renderer[hasClass ? 'removeClass' : 'addClass'](this.el.nativeElement, this.appToggleClass);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      let elements: any = document.getElementsByClassName(this.appToggleClass);
      elements = Array.from(elements);
      for (const element of elements) {
        this.renderer.removeClass(element, this.appToggleClass);
      }
    }
  }
}
