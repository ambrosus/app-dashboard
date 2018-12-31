import * as moment from 'moment-timezone';
import { StorageService } from '../services/storage.service';
declare let Web3: any;

const web3 = new Web3();
const storageService = new StorageService();

export const getName = (obj, alternative = 'No title') => {
    try {
        const name = obj.name;
        let type = obj.type.split('.');
        type = type[type.length - 1];
        return [name, type].find(i => i);
    } catch (e) {
        return alternative;
    }
};

export const getUrlName = (url) => {
    let name = url.split('/');
    name = name[name.length - 1];
    return name;
};

export const getImage = (obj) => {
    try {
        return obj.images.default.url;
    } catch (e) {
        return '/assets/raster/assets-image-default.png';
    }
};

export const getLocation = (event) => {
    const location = event.location || event;
    const { city, country, name } = location;
    return (
        [city, country, name].filter(item => !!item).join(', ') || 'No place attached'
    );
};

export const sortEventsByTimestamp = (a, b) => {
    if (a.timestamp > b.timestamp) {
        return -1;
    }
    if (a.timestamp < b.timestamp) {
        return 1;
    }
    return 0;
};

export const parseEvent = (event) => {
    event.info = {};
    event.info['groups'] = [];
    event.info['properties'] = [];

    // Extract event objects
    if (event.content.data && Array.isArray(event.content.data)) {
        event.content.data.map((obj, index, array) => {
            const type = obj.type.split('.');
            obj.type = type[type.length - 1].toLowerCase();

            if (obj.type === 'location' || obj.type === 'identifiers') {
                event.info[obj.type] = obj;
            } else {
                event.info.name = obj.name || obj.type;

                Object.keys(obj).map((key: any) => {
                    if (['images', 'documents', 'description'].indexOf(key) > -1) {
                        event.info[key] = obj[key];
                    }

                    if (
                        [
                            'type',
                            'name',
                            'assetType',
                            'eventId',
                            'createdBy',
                            'timestamp',
                            'location',
                            'images',
                            'documents',
                            'description',
                            'identifiers',
                            'groups',
                            'properties',
                        ].indexOf(key) === -1
                    ) {
                        const property = {
                            key,
                            value: obj[key],
                        };
                        event.info[
                            typeof property.value === 'string' ||
                                Array.isArray(property.value)
                                ? 'properties'
                                : 'groups'
                        ].push(property);
                    }
                });
            }

            return obj;
        });
    }

    return event;
};

export const parseAsset = (asset) => {
    if (!asset.info) {
        asset.info = {};
    }
    asset.info['groups'] = [];
    asset.info['properties'] = [];

    Object.keys(asset.info).map((key: any) => {
        if (key === 'location' || key === 'identifiers') {
            asset[key] = asset.info[key];
        } else {
            if (
                [
                    'type',
                    'name',
                    'assetType',
                    'images',
                    'eventId',
                    'createdBy',
                    'timestamp',
                    'groups',
                    'properties',
                ].indexOf(key) === -1
            ) {
                const property = {
                    key,
                    value: asset.info[key],
                };
                asset.info[
                    typeof property.value === 'string' || Array.isArray(property.value)
                        ? 'properties'
                        : 'groups'
                ].push(property);
            }
        }
    });
};

export const parseTimelineEvents = (e) => {
    const account: any = storageService.get('account') || {};

    const events = e.reduce((_events, { content, eventId }) => {
        const timestamp = content.idData.timestamp;
        const createdBy = content.idData.createdBy;

        if (content && content.data) {
            content.data.map(obj => {
                const parts = obj.type.split('.');
                const type = parts[parts.length - 1];
                const category = parts[parts.length - 2] || 'asset';
                const namespace = parts[parts.length - 3] || 'ambrosus';
                const ago = moment.tz(timestamp * 1000, account.timeZone || 'UTC').fromNow();

                obj.timestamp = timestamp;
                obj.createdBy = createdBy;
                obj.name = obj.name || type;
                obj.type = type;
                obj.eventId = eventId;
                obj.ago = ago;

                if (obj.type === 'location' && category === 'event') {
                    content.data.reduce((location, _event) => {
                        if (_event.type !== 'location') {
                            _event.location = location;
                        }
                    }, obj);
                }

                const notInclude = ['location', 'identifier', 'identifiers'];
                if (notInclude.indexOf(obj.type) === -1) {
                    _events.push(obj);
                }

                return obj;
            });
        }
        return _events;
    }, []);

    events.sort(sortEventsByTimestamp);

    return events;
};

export const sign = (data, secret) => {
    return web3.eth.accounts.sign(serializeForHashing(data), secret).signature;
};

export const calculateHash = (data) => {
    return web3.eth.accounts.hashMessage(serializeForHashing(data));
};

export const serializeForHashing = (object) => {
    const isDict = subject =>
        typeof subject === 'object' && !Array.isArray(subject);
    const isstring = subject => typeof subject === 'string';
    const isArray = subject => Array.isArray(subject);

    if (isDict(object)) {
        const content = Object.keys(object)
            .sort()
            .map(key => `"${key}":${serializeForHashing(object[key])}`)
            .join(',');
        return `{${content}}`;
    } else if (isArray(object)) {
        const content = object
            .map(item => serializeForHashing(item))
            .join(',');
        return `[${content}]`;
    } else if (isstring(object)) {
        return `"${object}"`;
    }

    return object.toString();
};

export const validTimestamp = (timestamp) => {
    return new Date(timestamp).getTime() > 0;
};

export const isLatest = (type) => {
    return (['info', 'redirection', 'identifiers', 'branding', 'location'].indexOf(type) === -1);
};

export const findEvent = (eventType, events) => {
    let e = false;
    events.map(event => {
        if (event.content.data) {
            event.content.data.map(obj => {
                const type = obj.type.split('.');
                obj.type = type[type.length - 1];
                obj.type = obj.type.toLowerCase();

                if (obj.type === 'location' || obj.type === 'identifiers') {
                    event.content.data.map(_obj => {
                        if (['location', 'identifiers'].indexOf(_obj.type) === -1) {
                            _obj[obj.type === 'location' ? 'location' : 'identifiers'] = obj;
                        }
                    });
                }

                switch (eventType) {
                    case 'latest':
                        if (isLatest(obj.type)) {
                            e = obj;
                        }
                        break;
                    default:
                        if (obj.type === eventType) {
                            e = obj;
                        }
                }

                return obj;
            });
        }

        return event;
    });

    return e;
};
