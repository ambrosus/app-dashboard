import * as moment from 'moment-timezone';

export const isValidDate = date => moment(date).isValid();

export const getTimestamp = () => moment().unix();

export const timestampToDateString = ts => moment.unix(ts).format('MMMM Do YYYY, h:mm:ss a');

export const getTimestampMonthStart = () =>
    moment()
        .startOf('M')
        .unix();

export const getTimestampDateStart = date =>
    moment(date)
        .startOf('d')
        .unix();

export const getTimestampDateEnd = date =>
    moment(date)
        .endOf('d')
        .unix();

export const getTimestampSubHours = h =>
    moment()
        .subtract(h, 'hours')
        .unix();

export const getTimestampSubDays = d =>
    moment()
        .subtract(d, 'days')
        .unix();

export const getTimestampSubWeeks = w =>
    moment()
        .subtract(w, 'weeks')
        .unix();

export const getTimestampSubMonths = m =>
    moment()
        .subtract(m, 'months')
        .unix();

export const getTimestampAddDays = d =>
    moment()
        .add(d, 'days')
        .unix();
