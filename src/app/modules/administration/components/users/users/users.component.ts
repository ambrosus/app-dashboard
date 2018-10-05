import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  sidebar = [
    {
      title: 'All users',
      link: 'all',
      icon: 'users',
      permission: 'users',
    },
    {
      title: 'Invite members',
      link: 'invite',
      icon: 'user-plus',
      permission: 'invites',
    },
    {
      title: 'Invites',
      link: 'invites',
      icon: 'user-check',
      permission: 'invites',
    },
    {
      title: 'Roles',
      link: 'roles',
      icon: 'user-check',
      permission: 'roles',
    },
  ];

  userSidebar = [];
  permissions: string[];

  constructor() { }

  ngOnInit() {
    this.permissions = ['invites', 'users', 'roles'];
    if (this.permissions.length) {
      this.generateSidebar();
    } else {
      this.userSidebar = this.sidebar;
    }
  }

  generateSidebar() {
    this.userSidebar = this.sidebar.filter(module => {
      const validPermission = this.permissions.filter(p => p === module['permission']);
      if (validPermission.length !== 0) { return module; }
    });
  }

}
