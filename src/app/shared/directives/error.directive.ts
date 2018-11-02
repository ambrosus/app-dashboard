import { Directive, Input, ElementRef, OnChanges, HostListener, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appError]',
})
export class ErrorDirective implements OnChanges, OnInit {
  error;
  parent;
  controlName;

  @Input() appError: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.parent = this.el.nativeElement.parentNode;
    this.controlName = this.el.nativeElement.attributes['formcontrolname'].nodeValue;
  }

  ngOnChanges() {
    if (this.appError && this.appError[this.controlName] && this.el.nativeElement.classList.contains('ng-invalid')) {
      this.createError();
    } else { this.removeError(); }
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event) {
    const classList = this.el.nativeElement.classList;
    if (classList.contains('ng-dirty') && classList.contains('ng-invalid')) {
      this.createError();
    } else { this.removeError(); }
  }

  createError() {
    if (!this.error) {
      this.renderer.addClass(this.parent, 'error');
      const message = document.createElement('p');
      message.textContent = this.appError[this.controlName] || this.appError || '';
      message.className = 'message';
      this.renderer.appendChild(this.parent, message);
      this.error = true;
    }
  }

  removeError() {
    if (this.error) {
      this.renderer.removeClass(this.parent, 'error');
      this.renderer.removeChild(this.parent, this.parent.lastChild);
      this.error = false;
    }
  }
}
