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
