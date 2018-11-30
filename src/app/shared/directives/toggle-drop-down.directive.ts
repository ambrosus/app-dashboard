import { Directive, Input, Renderer2, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appToggleDropDown]',
})
export class ToggleDropDownDirective {
  dropDown: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  @HostListener('click') onClick() {
    if (!this.dropDown) {
      this.dropDown = this.el.nativeElement.children;
      this.dropDown = Array.from(this.dropDown);
      this.dropDown = this.dropDown.find(element => element.tagName.toLowerCase() === 'app-drop-down');
      if (!this.dropDown) { return; }
    }
    const hasClass = this.dropDown.classList.contains('active');

    this.renderer[hasClass ? 'removeClass' : 'addClass'](this.dropDown, 'active');
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event) {
    if (!this.el.nativeElement.contains(event.target) && this.dropDown) {
      this.renderer['removeClass'](this.dropDown, 'active');
    }
  }
}
