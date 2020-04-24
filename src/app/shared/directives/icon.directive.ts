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
    this.path = `./assets/svg/${this.appIconLeft}.svg`;
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
    this.path = `./assets/svg/${this.appIconRight}.svg`;
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
