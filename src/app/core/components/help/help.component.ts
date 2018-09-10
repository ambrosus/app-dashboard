import { Component, OnInit, ViewEncapsulation, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HelpComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  contentSub: Subscription;
  category;
  question;
  content: any;

  constructor(private http: HttpClient, private route: ActivatedRoute, private sanitizer: DomSanitizer, private el: ElementRef, private renderer: Renderer2) { }

  sanitizeHTML = this.sanitizer.bypassSecurityTrustHtml;

  ngOnInit() {
    this.routeSub = this.route.url.subscribe(url => {
      if (url.length >= 2) {
        this.category = url[0].path.replace(/%20/g, ' ');
        this.question = url[1].path.replace(/%20/g, ' ');

        const _url = `/assets/help/pages/${this.category}/${this.question}.html`;
        this.contentSub = this.http.get(_url, { responseType: 'text' }).subscribe(
          page => {
            this.content = page;

            try {
              let questions = this.el.nativeElement.querySelectorAll('.sidebar-pages__sidebar__item__menu li');
              questions = Array.from(questions);
              questions.map(q => this.renderer.removeClass(q, 'active'));

              const title = this.el.nativeElement.querySelector(`#${this.slug(this.category)}`);
              const content = title.nextElementSibling;
              const question = this.el.nativeElement.querySelector(`#${this.slug(this.question)}`);
              this.renderer.addClass(title, 'active');
              this.renderer.addClass(content, 'active');
              this.renderer.addClass(question, 'active');
            } catch (err) { }
          },
          error => this.content = ''
        );
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.contentSub) { this.contentSub.unsubscribe(); }
  }

  slug(text) {
    return text
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }
}
