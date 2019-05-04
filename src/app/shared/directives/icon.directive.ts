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

import { Directive, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Directive({
  selector: '[appIconLeft]',
})
export class IconLeftDirective implements OnInit {
  path;

  @Input() appIconLeft: string;

  constructor(private http: HttpClient, private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.path = `/assets/svg/${this.appIconLeft}.svg`;
    this.loadIcon();
  }

  loadIcon() {
    this.http.get(this.path, { responseType: 'text' }).subscribe(
      res => {
        const element = this.el.nativeElement;
        const parser = new DOMParser();
        const svg = parser.parseFromString(res, 'image/svg+xml');
        this.renderer.insertBefore(element, svg.documentElement, element.firstChild);
      },
      err => {
        console.error(err);
      },
    );
  }
}

@Directive({
  selector: '[appIconRight]',
})
export class IconRightDirective implements OnInit {
  path;

  @Input() appIconRight: string;

  constructor(private http: HttpClient, private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.path = `/assets/svg/${this.appIconRight}.svg`;
    this.loadIcon();
  }

  loadIcon() {
    this.http.get(this.path, { responseType: 'text' }).subscribe(
      res => {
        const element = this.el.nativeElement;
        const parser = new DOMParser();
        const svg = parser.parseFromString(res, 'image/svg+xml');
        this.renderer.appendChild(element, svg.documentElement);
      },
      err => {
        console.error(err);
      },
    );
  }
}
