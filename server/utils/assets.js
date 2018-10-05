/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
isLatest = type => ['info', 'redirection', 'identifiers', 'branding', 'location'].indexOf(type) === -1;

exports.findEvent = (eventType, events) => {
  let e = false;
  events.find(event => {
    if (event.content.data) {
      return event.content.data.find(obj => {
        const type = obj.type.split('.');
        obj.type = type[type.length - 1].toLowerCase();
        obj.eventId = event.eventId;
        obj.createdBy = event.content.idData.createdBy;
        obj.timestamp = event.content.idData.timestamp;
        switch (eventType) {
          case 'latest':
            if (isLatest(obj.type)) { e = obj; return true; }
            break;
          default:
            if (obj.type === eventType) { e = obj; return true; }
        }
      });
    } else { return false; }
  });
  return e;
};
