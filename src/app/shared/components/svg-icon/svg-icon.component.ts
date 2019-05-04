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

import { Component, Input, ChangeDetectionStrategy, ElementRef, Renderer2, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-svg-icon',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgIconComponent implements OnInit {
  path;

  @Input() name;
  @Input() url;
  @Input() width;
  @Input() height;
  @Input() fill;

  constructor(private http: HttpClient, private renderer: Renderer2, private el: ElementRef) {
  }

  ngOnInit() {
    this.path = this.url ? this.url : `/assets/svg/${this.name}.svg`;
    this.loadSvg();
  }

  loadSvg() {
    this.http.get(this.path, { responseType: 'text' }).subscribe(
      res => {
        // get our element and clean it out
        const element = this.el.nativeElement;
        element.innerHTML = '';
        // get response and build svg element
        const parser = new DOMParser();
        const svg = parser.parseFromString(res, 'image/svg+xml');
        // insert the svg result
        const svgElement = svg.documentElement;
        // set width, height and fill
        svgElement.setAttribute('style', `
          ${this.width ? 'width:' + this.width + 'px;' : ''}
          ${this.height ? 'height:' + this.height + 'px;' : ''}
          ${this.fill ? 'fill: #' + this.fill + ';' : ''}
        `);
        this.renderer.appendChild(element, svgElement);
      },
      err => {
        console.error(err);
      },
    );
  }
}
