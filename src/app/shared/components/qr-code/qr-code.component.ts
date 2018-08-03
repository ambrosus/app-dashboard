import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';
import { AdministrationService } from '../../../services/administration.service';
import { DomSanitizer } from '@angular/platform-browser';

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

  constructor(private el: ElementRef, private renderer: Renderer2,
    private administration: AdministrationService, private sanitize: DomSanitizer) {}

  ngOnInit() {
    this.generateQR();
    this.logo = this.logo ? this.logo : this.administration.companyLogo;
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
        console.log('QR code fail: ', err);
      });
  }

  resizeLogo(w = 40, h = 40) {
    return new Promise((res, rej) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      const img = document.createElement('img');
      img.src = this.logo;

      try {
        img.onerror = () => {
          this.logo = false;
          rej();
        };

        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h);
          const url = canvas.toDataURL();
          res(url);
        };
      } catch (err) {
        this.logo = false;
        rej();
      }
    });
  }

  drawLogo(canvas) {
    return new Promise((_resolve, _reject) => {
      this.resizeLogo().then((url: any) => {
        const img = document.createElement('img');
        img.src = url;
        img.onload = () => {
          const ctx = canvas.getContext('2d');

          const width = img.width;
          const height = img.height;

          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;

          ctx.drawImage(img, x, y, width, height);
          _resolve(canvas);
        };
      }).catch (err => {
        _resolve(canvas);
      });
    });
  }
}
