import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appClickThisActive]'
})
export class ClickThisActiveDirective {

  constructor(private el: ElementRef,
              private renderer: Renderer2) { }

  @HostListener('click') onClick() {
    if (!this.el.nativeElement.classList.contains('active')) {
      this.renderer.addClass(this.el.nativeElement, 'active');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'active');
    }
  }

}
