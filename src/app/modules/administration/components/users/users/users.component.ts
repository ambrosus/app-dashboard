import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  sidebar = [
    {
      title: 'All users',
      link: 'all',
      icon: 'users'
    },
    {
      title: 'Invite members',
      link: 'invite',
      icon: 'user-plus'
    },
    {
      title: 'Invites',
      link: 'invites',
      icon: 'user-check'
    }
  ];

  constructor() { }

  ngOnInit() {
  }
}
