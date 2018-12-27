import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/compiler/src/core';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationsService } from 'app/services/organizations.service';

@Component({
  selector: 'app-initial',
  templateUrl: './initial.component.html',
  styleUrls: ['./initial.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class InitialComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  inviteId: string;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private organizationsService: OrganizationsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.subs[this.subs.length] = this.route.queryParams.subscribe(
      queryParams => {
        this.inviteId = queryParams.inviteId;
        if (this.inviteId) {
          this.verifyInvite();
        }
      },
    );
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe());
  }

  async verifyInvite(): Promise<any> {
    try {
      const invite = await this.organizationsService.verifyInvite(this.inviteId);
      this.authService.inviteId = this.inviteId;
      console.log('[GET] Invite verified: ', invite);
    } catch (error) {
      this.authService.inviteId = '';
      this.router.navigate(['/login']);
    }
  }
}
