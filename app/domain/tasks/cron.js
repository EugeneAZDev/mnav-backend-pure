async (storeMonths) => {
  // DEBUG schedule each 5 seconds:
  // common.cron.schedule('*/5 * * * * *', () => {
  common.cron.schedule('0 0 1 * *', () => {
    domain.tasks.cleanDb(storeMonths);
  });
};
