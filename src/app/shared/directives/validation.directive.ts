import { Directive, ElementRef, Renderer2, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appValidation]'
})
export class ValidationDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @Input() data;
  @Input() validate: string;

  ngOnInit() {
    this.checkNested(this.data, this.validate.split('.').splice(1));
  }

  checkNested(obj , args) {
    for (let i = 0; i < args.length; i++) {
      if (!obj || !obj.hasOwnProperty(args[i])) {
        this.el.nativeElement.style.display = 'none';
      }
      obj = obj[args[i]];
    }
  }

}
