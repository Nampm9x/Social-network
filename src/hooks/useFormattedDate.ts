import { useCallback } from 'react';
import moment from 'moment';

export const useFormattedDate = () => {
  const formatDate = useCallback((date: string | Date, format: string = 'MMMM DD, YYYY'): string => {
    return moment(date).format(format);
  }, []);

  return formatDate;
};

export const useFormatedTime = (time: string) => {

  const duration = moment.duration(moment().diff(moment(time)));

  let formattedTime;
  if (duration.asSeconds() < 60) {
    formattedTime = Math.floor(duration.asSeconds()) + 's';
  } else if (duration.asMinutes() < 60) {
    formattedTime = Math.floor(duration.asMinutes()) + 'm';
  } else if (duration.asHours() < 24) {
    formattedTime = Math.floor(duration.asHours()) + 'h';
  } else if (duration.asDays() < 30) {
    formattedTime = Math.floor(duration.asDays()) + 'd';
  } else if (duration.asMonths() < 12) {
    formattedTime = Math.floor(duration.asMonths()) + 'mo';
  } else {
    formattedTime = Math.floor(duration.asYears()) + 'y';
  }

  return formattedTime

}