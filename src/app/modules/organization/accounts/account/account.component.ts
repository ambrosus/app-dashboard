import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from 'app/services/users.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit, OnDestroy {
  getUserSub: Subscription;
  routeSub: Subscription;
  userForm: FormGroup;
  user;
  email;

  constructor(private usersService: UsersService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => this.email = params.email);
    this.getUser();
  }

  ngOnDestroy() {
    if (this.getUserSub) { this.getUserSub.unsubscribe(); }
  }

  initUserForm() {
    this.userForm = new FormGroup({
      address: new FormControl({ value: this.user.address, disabled: true }),
      name: new FormControl({ value: this.user.name, disabled: true }),
      email: new FormControl({ value: this.user.email, disabled: true }),
      timeZone: new FormControl({ value: this.user.timeZone, disabled: true }),
    });
  }

  getUser() {
    this.getUserSub = this.usersService.getUser(this.email).subscribe(
      (resp: any) => {
        console.log('USER GET: ', resp);
        this.user = resp;
        this.initUserForm();
      },
      err => this.router.navigate(['../'], { relativeTo: this.route })
    );
  }

  save() {

  }
}
