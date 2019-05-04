/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
  hideCheckmarkSign;

  @Input() appError: any[];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    [this.form, this.hideCheckmarkSign] = this.appError;
    this.parent = this.el.nativeElement.parentNode;
    this.controlName = this.el.nativeElement.attributes['formcontrolname'].nodeValue;

    // Valid sign and class
    this.statusSub = this.form.get(this.controlName).statusChanges.subscribe(
      status => {
        if (status === 'VALID') {
          if (this.hideCheckmarkSign) { this.renderer.addClass(this.parent, 'no-sign'); }
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
