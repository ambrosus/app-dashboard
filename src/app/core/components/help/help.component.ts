import { Component, OnInit, ViewEncapsulation, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { HelpService } from './help.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HelpComponent implements OnInit, OnDestroy {
  routeSub: Subscription;
  contentSub: Subscription;
  category;
  question;
  content: any;
  sidebar = [
    {
      title: 'Getting started',
      menu: [
        { title: 'What is Dashboard', link: '/help/Getting started/What is Dashboard' },
        { title: 'How it works', link: '/help/Getting started/How it works' },
        { title: 'Dashboard setup', link: '/help/Getting started/Dashboard setup' },
      ]
    },
    {
      title: 'Administration',
      menu: [
        { title: 'User invites', link: '/help/Administration/User invites' },
        { title: 'Managing users', link: '/help/Administration/Managing users' },
      ]
    },
    {
      title: 'User',
      menu: [
        { title: 'Creating an account', link: '/help/User/Creating an account' },
        { title: 'Editing profile', link: '/help/User/Editing profile' },
        { title: 'Password change', link: '/help/User/Password change' },
        { title: 'Security', link: '/help/User/Security' },
      ]
    },
    {
      title: 'Assets',
      menu: [
        { title: 'What are assets', link: '/help/Assets/What are assets' },
        { title: 'Create an asset', link: '/help/Assets/Create an asset' },
        { title: 'View assets', link: '/help/Assets/View assets' },
        { title: 'Search assets', link: '/help/Assets/Search assets' },
      ]
    },
    {
      title: 'Events',
      menu: [
        { title: 'What are events', link: '/help/Events/What are events' },
        { title: 'Create an event', link: '/help/Events/Create an event' },
        { title: 'Edit event', link: '/help/Events/Edit event' },
        { title: 'View events', link: '/help/Events/View events' },
        { title: 'Search events', link: '/help/Events/Search events' },
      ]
    }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private el: ElementRef,
    private renderer: Renderer2,
    private helpService: HelpService
  ) { }

  sanitizeHTML = this.sanitizer.bypassSecurityTrustHtml;

  ngOnInit() {
    this.routeSub = this.route.url.subscribe(url => {
      if (url.length >= 2) {
        try {
          this.category = decodeURIComponent(url[0].path);
          this.question = decodeURIComponent(url[1].path);
        } catch (e) {
          this.category = url[0].path;
          this.question = url[1].path;
        }

        this.contentSub = this.helpService.get(this.category, this.question).subscribe(
          (page: any) => {
            this.content = this.sanitizeHTML(page);

            try {
              const title = this.el.nativeElement.querySelector(`#${this.slug(this.category)}`);
              const content = title.nextElementSibling;
              this.renderer.addClass(title, 'active');
              this.renderer.addClass(content, 'active');
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
