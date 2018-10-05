import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { StorageService } from 'app/services/storage.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/services/auth.service';
import { InviteService } from 'app/services/invite.service';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.scss'],
})
export class InvitesComponent implements OnInit, OnDestroy {
  invitesSub: Subscription;
  revokeInvitesSub: Subscription;
  selectAllText = 'Select all';
  invites;
  ids = [];

  constructor(
    private storage: StorageService,
    private el: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService,
    private inviteService: InviteService
  ) { }

  ngOnInit() {
    this.getInvites();
  }

  ngOnDestroy() {
    if (this.invitesSub) { this.invitesSub.unsubscribe(); }
    if (this.revokeInvitesSub) { this.revokeInvitesSub.unsubscribe(); }
  }

  getInvites() {
    const user: any = this.storage.get('user') || {};

    this.invitesSub = this.inviteService.getInvites(user).subscribe(
      (resp: any) => {
        this.invites = resp;
        console.log('Invites GET: ', resp);
      },
      err => console.error('Invites GET error: ', err)
    );
  }

  bulkActions(action) {
    switch (action.value) {
      case 'revoke':
        this.revokeInvitesSub = this.inviteService.revokeInvites(this.ids).subscribe(
          (resp: any) => {
            this.getInvites();
            console.log('Invites DELETE: ', resp);
          },
          err => console.error('Invites DELETE error: ', err.message)
        );
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
    if (active) {
      this.toggleId('remove', item.id);
    } else {
      this.toggleId('add', item.id);
    }
  }
}
