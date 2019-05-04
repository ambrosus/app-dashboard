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

import { Component, OnInit, Input, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { StorageService } from 'app/services/storage.service';

declare let QRCode: any;

@Component({
  selector: 'app-qr-code',
  template: '',
  styleUrls: ['./qr-code.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QrCodeComponent implements OnInit {

  @Input() value;
  @Input() size;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.generateQR();
  }

  generateQR() {
    const canvas = document.createElement('canvas');

    QRCode.toCanvas(canvas, this.value, { errorCorrectionLevel: 'M' })
      .then(c => {
        const img = document.createElement('img');
        img.src = c.toDataURL();
        img.width = this.size ? this.size : 300;
        img.height = this.size ? this.size : 300;

        this.renderer.appendChild(this.el.nativeElement, img);
      })
      .catch(err => {
        console.log('QR code fail: ', err);
      });
  }
}
