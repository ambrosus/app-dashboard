import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';
import { StorageService } from 'app/services/storage.service';

declare let QRCode: any;

@Component({
  selector: 'app-qr-code',
  template: '',
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {
  logo;

  @Input() value;
  @Input() size;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.generateQR();

    let companySettings: any = {};
    try {
      companySettings = JSON.parse(this.storageService.get('user')['company']['settings']);
    } catch (e) { }

    this.logo = companySettings.logo || false;
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

  resizeLogo(maxSize = 40) {
    return new Promise((res, rej) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let url: any = this.logo;
      const img = document.createElement('img');
      img.src = url;
      img.onerror = () => {
        this.logo = false;
        rej();
      };

      img.onload = () => {
        try {
          let width = maxSize;
          let height = (img.height * maxSize) / img.width;

          if (img.width < img.height) {
            height = maxSize;
            width = (img.width * maxSize) / img.height;
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);
          url = canvas.toDataURL();
          res(url);
        } catch (err) {
          this.logo = false;
          rej();
        }
      };
    });
  }

  drawLogo(canvas) {
    return new Promise((_resolve, _reject) => {
      this.resizeLogo()
        .then((url: any) => {
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
        })
        .catch(err => {
          _resolve(canvas);
        });
    });
  }
}
