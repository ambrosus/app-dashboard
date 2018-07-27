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
    QRCode.toDataURL(this.value, { errorCorrectionLevel: 'L' }).then(url => {
        const img = document.createElement('img');
        img.src = url;
        img.width = this.size ? this.size : 300;
        img.height = this.size ? this.size : 300;
        this.renderer.appendChild(this.el.nativeElement, img);
    }).catch(err => {
      console.log('QRCode generate error: ', err);
    });
  }
}
