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

import { Directive, ElementRef, Input, HostListener, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appSticky]',
})
export class StickyDirective implements OnInit {
  sticked = true;
  windowOffsetTop = 0;
  offset = 0;
  screenWidth;
  documentHeight = 0;

  @Input() addClass = 'fixed';
  @Input() offsetTop = 0;

  constructor(private el: ElementRef, private render: Renderer2) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    this.offset = this.el.nativeElement.offsetTop + +this.offsetTop - 15;
  }

  private addSticky() {
    this.sticked = true;
    this.render.addClass(this.el.nativeElement, this.addClass);
  }

  private removeSticky() {
    this.sticked = false;
    this.render.removeClass(this.el.nativeElement, this.addClass);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight,
      document.body.clientHeight);

    if (this.screenWidth > 768) {
      this.windowOffsetTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      if ((this.windowOffsetTop + +this.offsetTop > this.offset) && this.documentHeight > 1000) {
        this.addSticky();
      } else {
        this.removeSticky();
      }
    }
  }
}
