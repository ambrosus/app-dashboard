import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

declare let QRCode: any;

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {
  @Input() value;
  @Input() size;
  @Input() logo;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.generateQR();
  }

  generateQR() {
    const canvas = document.createElement('canvas');

    QRCode.toCanvas(canvas, this.value, { errorCorrectionLevel: 'M' })
      .then(c => {
        this.drawLogo(c).then((_c: any) => {
          const img = document.createElement('img');
          img.src = _c.toDataURL();
          img.width = this.size ? this.size : 300;
          img.height = this.size ? this.size : 300;

          this.renderer.appendChild(this.el.nativeElement, img);
        });
      })
      .catch(err => {
        console.log('QRCode generate error: ', err);
      });
  }

  drawLogo(canvas) {
    return new Promise((resolve, reject) => {
      if (this.logo) {
        const img = document.createElement('img');
        img.src = this.logo;
        img.onload = () => {
          const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

          const width = 40;
          const height = 40;

          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;

          ctx.drawImage(img, x, y, width, height);
          resolve(canvas);
        };
      } else {
        resolve(canvas);
      }
    });
  }
}
