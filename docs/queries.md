
Queries that are useful to have in the API:

1. Get all the assets with info event attached:
ie. GET /assets?createdBy=...&info=true

2. Get all the events, which data property contains the string:
ie. GET /events?data[name]=...&contains=true
