import { Component, OnInit, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrls: ['./all.component.scss']
})
export class AllComponent implements OnInit, OnDestroy {
  selectAllText = 'Select all';
  usersSubscription: Subscription;
  users = [];
  ids = [];

  constructor(private el: ElementRef, private renderer: Renderer2, private http: HttpClient, private auth: AuthService) { }

  ngOnInit() {
    this.getUsers();
  }

  ngOnDestroy() {
    if (this.usersSubscription) { this.usersSubscription.unsubscribe(); }
  }

  getUsers() {
    // Get users
    const url = `/api/users`;

    this.usersSubscription = this.http.get(url).subscribe(
      (resp: any) => {
        console.log('Users GET: ', resp);
        this.users = resp.data;
      },
      err => {
        if (err.status === 401) { this.auth.logout(); }
        console.log('Users GET error: ', err);
      }
    );
  }

  bulkActions(action) {
    switch (action.value) {
      default:
        break;
    }
    action.value = 'default';
  }

  toggleId(action, id) {
    const index = this.ids.indexOf(id);
    switch (action) {
      case 'add':
        if (index === -1) { this.ids.push(id); }
        break;
      default:
        if (index > -1) { this.ids.splice(index, 1); }
    }
  }

  onSelectAll(e, input) {
    let table = this.el.nativeElement.querySelectorAll('.table__item.table');
    table = Array.from(table);
    if (input.checked) {
      this.selectAllText = 'Unselect all';
      table.map((item) => {
        this.renderer.addClass(item, 'checkbox--checked');
        this.toggleId('add', item.id);
      });
    } else {
      this.selectAllText = 'Select all';
      table.map((item) => {
        this.renderer.removeClass(item, 'checkbox--checked');
        this.toggleId('remove', item.id);
      });
    }
  }

  onSelect(e, item) {
    const active = item.classList.contains('checkbox--checked');
    const action = active ? 'removeClass' : 'addClass';
    this.renderer[action](item, 'checkbox--checked');
    if (active) { this.toggleId('remove', item.id); } else { this.toggleId('add', item.id); }
  }
}
