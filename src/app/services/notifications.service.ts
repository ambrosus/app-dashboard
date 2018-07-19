import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private storage: StorageService) { }

  createNotification(message, address) {
    let notifications: any = this.storage.get('notifications');
    notifications = notifications ? JSON.parse(notifications) : [];

    if (notifications.some((n) => n.address === address)) {
      notifications.map((user) => {
        if (user.address === address) {
          user.notifications.unshift({
            notification: message,
            timestamp: Date.now()
          });
        }
      });
    } else {
      notifications.push({
        address: address,
        notifications: [{
          notification: message,
          timestamp: Date.now()
        }]
      });
    }

    this.storage.set('notifications', JSON.stringify(notifications));
  }

  getUserNotifications(address) {
    let notifications: any = this.storage.get('notifications');
    notifications = notifications ? JSON.parse(notifications) : [];

    let user: any;

    const limit = 1000 * 60 * 60 * 24 * 3;

    notifications.map((u) => {
      if (u.address === address) {
        // remove notifications older than 3 days
        u.notifications = u.notifications.filter((n) => Date.now() - n.timestamp < limit);
        user = u;
      }
    });

    this.storage.set('notifications', JSON.stringify(notifications));

    return user;
  }
}
