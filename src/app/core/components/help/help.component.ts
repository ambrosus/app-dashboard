import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
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

  constructor(private http: HttpClient, private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  sanitizeHTML = this.sanitizer.bypassSecurityTrustHtml;

  ngOnInit() {
    this.routeSub = this.route.url.subscribe(url => {
      if (url.length >= 2) {
        this.category = url[0].path;
        this.question = `${url[1].path}.html`;

        const _url = `/assets/help/pages/${this.category}/${this.question}`;
        this.contentSub = this.http.get(_url, { responseType: 'text' }).subscribe(
          page => this.content = page,
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
