export const getStartDateAndEndDate = (monthString: string, year: number) => {
  const formattedMonthString =
    monthString.charAt(0).toUpperCase() + monthString.slice(1).toLowerCase();
  const monthNumber = new Date(
    Date.parse(formattedMonthString + ' 1, ' + year),
  ).getMonth();
  const startDate = new Date(year, monthNumber, 1);

  // Get the last day of the month
  const endDate = new Date(year, monthNumber + 1, 0);

  // Format the dates using Intl.DateTimeFormat
  const dateFormatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const startDateString = dateFormatter.format(startDate);
  const endDateString = dateFormatter.format(endDate);

  const startDateFormatted =
    year +
    '-' +
    startDateString.split('/')[0] +
    '-' +
    startDateString.split('/')[1];

  const endDateFormatted =
    year +
    '-' +
    endDateString.split('/')[0] +
    '-' +
    endDateString.split('/')[1];

  return {startDate: startDateFormatted, endDate: endDateFormatted};
};
