import { Directive, Input, ElementRef, OnChanges, HostListener, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appError]',
})
export class ErrorDirective implements OnChanges, OnInit, OnDestroy {
  statusSub: Subscription;
  error;
  parent;
  controlName;
  form;
  hideValidSign;

  @Input() appError: any[];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    [this.form, this.hideValidSign] = this.appError;
    this.parent = this.el.nativeElement.parentNode;
    this.controlName = this.el.nativeElement.attributes['formcontrolname'].nodeValue;

    // Valid sign and class
    this.statusSub = this.form.get(this.controlName).statusChanges.subscribe(
      status => {
        if (status === 'VALID') {
          if (this.hideValidSign) { this.renderer.addClass(this.parent, 'no-sign'); }
          this.renderer.addClass(this.parent, 'valid');
        } else {
          this.renderer.removeClass(this.parent, 'valid');
          this.renderer.removeClass(this.parent, 'no-sign');
        }
      },
    );
  }

  ngOnChanges() {
    if (this.el.nativeElement.classList.contains('ng-invalid')) {
      this.createError();
    } else { this.removeError(); }
  }

  ngOnDestroy() {
    if (this.statusSub) { this.statusSub.unsubscribe(); }
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event) {
    const classList = this.el.nativeElement.classList;
    if (classList.contains('ng-dirty') && classList.contains('ng-invalid')) {
      this.createError();
    } else { this.removeError(); }
  }

  getErrorMessage() {
    const controlErrors = this.form.get(this.controlName).errors;
    return Object.keys(controlErrors).reduce((message, key, index, array) => {
      if (controlErrors[key]) { message += message ? `, ${key}` : key; }
      return message;
    }, '');
  }

  createError() {
    if (this.error) { this.removeError(); }
    this.renderer.addClass(this.parent, 'error');
    const message = document.createElement('p');
    message.textContent = this.getErrorMessage();
    message.className = 'message';
    this.renderer.appendChild(this.parent, message);
    this.error = true;
  }

  removeError() {
    if (this.error) {
      this.renderer.removeClass(this.parent, 'error');
      this.renderer.removeChild(this.parent, this.parent.lastChild);
      this.error = false;
    }
  }
}
