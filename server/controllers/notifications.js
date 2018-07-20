const fs = require('fs');

let notifications_cache;

function getNotifications() {

  if (notifications_cache){
    return notifications_cache;
  }

  if (!fs.existsSync(`${__dirname}/../notifications.json`)) {
    fs.writeFile(`${__dirname}/../notifications.json`, JSON.stringify({}));
  }

  notifications_cache = JSON.parse(fs.readFileSync(`${__dirname}/../notifications.json`));

  return getNotifications(address);
}

function saveNotifications(notifications) {
  if (notifications) {
    try {
      fs.writeFileSync(`${__dirname}/../notifications.json`, JSON.stringify(notifications));
      notifications_cache = notifications;
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
}

exports.create = (req, res) => {
  const address = req.params.address;
  const notification = req.body.notification;
  const notifications = getNotifications();

  if (!notifications[address]) {
    notifications[address] = [];
  }

  notifications[address].push({
    _id: '',
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
}

exports.viewed = (req, res) => {
  const address = req.params.address;
  const viewedNotifications = req.body.notifications;
  const notifications = getNotifications();

  if (notifications[address]) {
    notifications[address].map((n) => {
      n.viewed = viewedNotifications.indexOf((id) => id === n._id ) > -1 ? true : false;
    });

    if (saveNotifications(notifications)) {
      return res.status(200).json({ message: 'Notifications marked as viewed success' });
    } else {
      return res.status(400).json({ message: 'Notifications marked as viewed failed' });
    }
  } else {
    res.status(404).json({ message: 'No address' });
  }
}

exports.get = (req, res) => {
  const address = req.params.address;
  const notifications = getNotifications();

  if (notifications[address]) {

    // Clean notifications older than 3days
    const limit = 1000 * 60 * 60 * 24 * 3;

    notifications[address] = notifications[address].filter((n) => Date.now() - n.timestamp < limit);

    saveNotifications(notifications);

    res.status(200).json({
      data: notifications[address],
      message: 'Success'
    });
  } else {
    res.status(404).json({ message: 'No address' });
  }
}

exports.clean = (req, res) => {
  const notifications = getNotifications();

  if (Object.keys(notifications).length > 0) {
    if (saveNotifications({})) {
      return res.status(200).json({
        message: 'Cleanup successful'
      });
    } else {
      return res.status(400).json({
        message: 'Cleanup failed'
      });
    }
  } else {
    return res.status(404).json({
      message: 'No notifications'
    });
  }
}
