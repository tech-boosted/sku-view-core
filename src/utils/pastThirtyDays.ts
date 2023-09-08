export const PastThirtyDays = () => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 30);
  const thirtyDaysAgoYear = currentDate.getFullYear();
  const thirtyDaysAgoMonth = String(currentDate.getMonth() + 1).padStart(
    2,
    '0',
  );
  const thirtyDaysAgoDay = String(currentDate.getDate()).padStart(2, '0');
  const thirtyDaysAgoFormatted = `${thirtyDaysAgoYear}-${thirtyDaysAgoMonth}-${thirtyDaysAgoDay}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayYear = yesterday.getFullYear();
  const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayFormatted = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

  // return {
  //   yesterdayFormatted: yesterdayFormatted,
  //   thirtyDaysAgoFormatted: thirtyDaysAgoFormatted,
  // };

  return {
    yesterdayFormatted: '2023-07-31',
    thirtyDaysAgoFormatted: '2023-07-01',
  };
};
