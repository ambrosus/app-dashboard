const CronJob = require('cron').CronJob;
const moment = require('moment');

const Invites = require('./../models/invites');

exports.start = () => {

  const job = new CronJob('0 */480 * * * *', () => {
    // Cron job runs every 480 minutes = Every 8 hours
    // 3 times a day
    Invites.find()
      .then(invites => {
        invites.forEach(invite => {
          if (moment().diff(invite.validUntil) < 0) {
            Invites.findByIdAndRemove(invite._id)
              .then(deleted => console.log('Invite expired, deleted'))
              .catch(error => console.log('Invite delete error: ', error));
          }
        });
      }).catch(error => console.log('CRON Invites find error: ', error));
  });

  job.start();

}
