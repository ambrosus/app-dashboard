import { Directive, ElementRef, Input, HostListener, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appSticky]'
})
export class StickyDirective implements OnInit {
  sticked = true;
  windowOffsetTop = 0;
  offset = 0;
  screenWidth;

  @Input() addClass = 'fixed';
  @Input() offsetTop = 0;

  constructor(private el: ElementRef, private render: Renderer2) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    this.offset = this.el.nativeElement.getBoundingClientRect().top;
  }

  private addSticky() {
    this.sticked = true;
    this.render.addClass(this.el.nativeElement, this.addClass);
  }

  private removeSticky() {
    this.sticked = false;
    this.render.removeClass(this.el.nativeElement, this.addClass);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.screenWidth > 1024) {
      this.windowOffsetTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      if (this.windowOffsetTop + this.offsetTop > this.offset) {
        this.addSticky();
      } else {
        this.removeSticky();
      }
    }
  }
}
