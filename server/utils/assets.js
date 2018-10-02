const isLatest = type => ['info', 'redirection', 'identifiers', 'branding', 'location'].indexOf(type) === -1;

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
