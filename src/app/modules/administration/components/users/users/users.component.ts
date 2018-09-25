import { Component, OnInit } from '@angular/core';
import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  sidebar = [
    {
      title: 'All users',
      link: 'users',
      icon: 'users',
      role: 'users'
    },
    {
      title: 'Invite members',
      link: 'invite',
      icon: 'user-plus',
      role: 'invites'
    },
    {
      title: 'Invites',
      link: 'invites',
      icon: 'user-check',
      role: 'invites'
    },
    {
      title: 'Roles',
      link: 'roles',
      icon: 'user-check',
      role: 'roles'
    }
  ];

  userSidebar = [];
  permissions: string[];

  constructor(private usersService: UsersService) { }

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
      const validPermission = this.permissions.filter(p => p === module['role']);
      if (validPermission.length !== 0 ) { return module; }
    });
  }

}
