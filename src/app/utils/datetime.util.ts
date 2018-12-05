import * as moment from 'moment-timezone';

export const isValidDate = date => moment(date).isValid();

export const getTimestamp = () => moment().unix();

export const timestampToDateString = ts => moment.unix(ts).format('MMMM Do YYYY, h:mm:ss a');

export const getTimestampMonthStart = () =>
    moment()
        .tz('UTC')
        .startOf('M')
        .unix();

export const getTimestampDateStart = date =>
    moment(date)
        .tz('UTC')
        .startOf('d')
        .unix();

export const getTimestampDateEnd = date =>
    moment(date)
        .tz('UTC')
        .endOf('d')
        .unix();

export const getTimestampSubHours = h =>
    moment()
        .tz('UTC')
        .subtract(h, 'h')
        .unix();

export const getTimestampSubDays = d =>
    moment()
        .tz('UTC')
        .subtract(d, 'd')
        .unix();

export const getTimestampSubWeeks = w =>
    moment()
        .tz('UTC')
        .subtract(w, 'w')
        .unix();

export const getTimestampSubMonths = m =>
    moment()
        .tz('UTC')
        .subtract(m, 'm')
        .unix();

export const getTimestampAddDays = d =>
    moment()
        .tz('UTC')
        .add(d, 'd')
        .unix();
