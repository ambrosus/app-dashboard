import { Directive, ElementRef, Renderer2, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appValidation]'
})
export class ValidationDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @Input() data;
  @Input() validate: string;

  ngOnInit() {

    if (!this.data[`${this.validate}`]) {
      this.el.nativeElement.style.display = 'none';
    }

  }

}
