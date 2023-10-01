import * as dayjs from 'dayjs';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as tz from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Dayjs } from 'dayjs';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export { dayjs };

export const isBetweenRange = (
  date: string,
  startDate: string | Date,
  endDate: string | Date,
): boolean => {
  return dayjs(date).isBetween(startDate, endDate, null, '[]');
};

export const getDatesBetweenRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const fromDate = new Date(startDate);
  const toDate = new Date(endDate);
  while (dayjs(fromDate).isBefore(dayjs(toDate))) {
    dates.push(dayjs(fromDate).format(DEFAULT_DATE_FORMAT));
    fromDate.setDate(fromDate.getDate() + 1);
  }
  dates.push(dayjs(toDate).format(DEFAULT_DATE_FORMAT));
  return dates;
};

export class DetailHour {
  from!: string;

  to!: string;
}

export const convertHours = (
  date: string,
  detailHours: DetailHour[],
  timezone: string,
): DetailHour[] => {
  return detailHours.map(({ from, to }) => {
    return {
      from: dayjs.tz(`${date} ${from}`, timezone).utc().format(),
      to: dayjs.tz(`${date} ${to}`, timezone).utc().format(),
    };
  });
};

export const getUtcDate = (date: string, hour: string, timezone: string): string => {
  return dayjs.tz(`${date} ${hour}`, timezone).utc().format();
};

export const getDayWithTz = (
  day: string | Date,
  timezone: string,
  keepLocalTime?: boolean,
): Dayjs => {
  return dayjs(day).tz(timezone, keepLocalTime);
};
