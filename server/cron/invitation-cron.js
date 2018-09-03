const CronJob = require('cron').CronJob;
const Invites = require('./../models/invites');

const job = new CronJob('0 */1 * * * *', () => {
    // Cron job runs every 480 minutes = Every 8 hours 
    // 3 times a day 
	const now = Math.floor(Date.now());
    Invites.find()
    .then(results => {
        results.forEach(result => {
            if (result.validUntil <= now) {
                Invites.deleteOne({_id: result._id})
                    .then(result => console.log(result))
                    .catch(error => console.log(error));
            }
        });
    }).catch(error => (reject(error)))
});

job.start();
