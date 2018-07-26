import { Component, Input, ChangeDetectionStrategy, ElementRef, Renderer2, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-svg-icon',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent implements OnInit {
  path;

  @Input() name;
  @Input() width;
  @Input() height;
  @Input() fill;

  constructor(private http: HttpClient, private renderer: Renderer2, private el: ElementRef) {
  }

  ngOnInit() {
    this.path = this.name.split('.').length > 1 ? this.name : `/assets/svg/${this.name}.svg`;
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
        this.renderer.appendChild(element, svg.documentElement);
        // set width and height
        this.renderer.setStyle(this.el.nativeElement.children[0], 'width', this.width || '100%');
        this.renderer.setStyle(this.el.nativeElement.children[0], 'height', this.height || '100%');
        this.renderer.setStyle(this.el.nativeElement.children[0], 'fill', this.fill || 'currentColor');
      },
      err => {
        console.error(err);
      }
    );
  }
}
