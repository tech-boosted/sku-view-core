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

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayDay = String(today.getDate()).padStart(2, '0');
  const todayFormatted = `${todayYear}-${todayMonth}-${todayDay}`;

  return {
    todayFormatted: todayFormatted,
    thirtyDaysAgoFormatted: thirtyDaysAgoFormatted,
  };
};
