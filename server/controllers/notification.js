

exports.create = (req, res) => {
  const address = req.params.address;
  const notification = req.body.notification;
  const notifications = getNotifications();

  if (!notifications[address]) {
    notifications[address] = [];
  }

  if (notification && notification.title && notification.message && notification.type) {
    notifications[address].push({
      _id: uuidv4(),
      title: notification.title,
      type: notification.type,
      message: notification.message,
      viewed: false,
      timestamp: Date.now()
    });

    if (saveNotifications(notifications)) {
      return res.status(200).json({ message: 'Notifications create success' });
    } else {
      return res.status(400).json({ message: 'Notifications create failed' });
    }
  } else if (!notification) {
    return res.status(400).json({ message: 'Notification required.' });
  } else if (!notification.title) {
    return res.status(400).json({ message: 'Notification title required.' });
  } else if (!notification.message) {
    return res.status(400).json({ message: 'Notification message required.' });
  } else if (!notification.type) {
    return res.status(400).json({ message: 'Notification type required.' });
  }
}

exports.seen = (req, res) => {
  const address = req.params.address;
  const seenNotifications = req.body.notifications;``
  const notifications = getNotifications();

  if (Array.isArray(seenNotifications) && seenNotifications.length > 0) {
    if (notifications[address]) {
      notifications[address].map((n) => {
        if (!n.viewed) {
          n.viewed = seenNotifications.indexOf(n._id) > -1 ? true : false;
        }
      });

      if (saveNotifications(notifications)) {
        return res.status(200).json({ message: 'Notifications marked as viewed success' });
      } else {
        return res.status(400).json({ message: 'Notifications marked as viewed failed' });
      }
    } else {
      res.status(404).json({ message: 'No address' });
    }
  } else {
    return res.status(400).json({ message: 'Non empty array of ids required' });
  }
}

exports.getNewestNotifications = address => {
  const notifications = getNotifications();

  if (notifications[address]) {

    // Clean notifications older than 3days
    const limit = 1000 * 60 * 60 * 24 * 3;

    notifications[address] = notifications[address].filter((n) => Date.now() - n.timestamp < limit);

    saveNotifications(notifications);

    return notifications[address];
  } else {
    return [];
  }
}

exports.get = (req, res) => {
  const address = req.params.address;
  const notifications = getNotifications();

  if (notifications[address]) {
    res.status(200).json({
      data: getNewestNotifications(notifications[address]),
      message: 'Success'
    });
  } else {
    res.status(404).json({ message: 'No address' });
  }
}
