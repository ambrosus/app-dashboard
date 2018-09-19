sortEventsByTimestamp = (a, b) => {
  if (a.timestamp > b.timestamp) {
    return -1;
  }
  if (a.timestamp < b.timestamp) {
    return 1;
  }
  return 0;
}

exports.parseEvents = e => {
  const events = e.results.reduce((_events, { content, eventId }) => {
    const timestamp = content.idData.timestamp;
    const author = content.idData.createdBy;

    if (content && content.data) {
      content.data.filter(obj => {
        const parts = obj.type.split('.');
        const type = parts[parts.length - 1];
        const category = parts[parts.length - 2] || 'asset';
        const namespace = parts[parts.length - 3] || 'ambrosus';

        obj.timestamp = timestamp;
        obj.author = author;
        obj.name = obj.name || type;
        obj.action = type;
        obj.type = type;
        obj.eventId = eventId;

        if (obj.type === 'location' && category === 'event') {
          content.data.reduce((location, _event) => {
            if (_event.type !== 'location') {
              _event.location = location;
            }
          }, obj);
        }

        _events.events.push(obj);
        return obj;
      });
    }
    return _events;
  }, { events: [], resultCount: e.resultCount });

  events.events.sort(sortEventsByTimestamp);

  return events;
}

exports.findEvent = (eventType, events) => {
  if (type === 'latest') {
    return events.reduce((latest, event) => {
      const isLatest = type => ['info', 'redirection', 'identifiers', 'branding', 'location'].indexOf(type) === -1;
      return event.content.data.find(obj => {
        const type = obj.type.split('.');
        obj.type = type[type.length - 1].toLowerCase();
        return isLatest(obj.type);
      });
    }, {});
  } else {
    return events.reduce((event, currentEvent) => {
      return currentEvent.content.data.find(obj => {
        const type = obj.type.split('.');
        obj.type = type[type.length - 1].toLowerCase();
        return obj.type === eventType;
      });
    }, {});
  }
}
