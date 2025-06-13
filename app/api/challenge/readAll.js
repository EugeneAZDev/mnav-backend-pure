({
  method: async ({ clientId }) => {
    try {
      const result = await crud('RecordChallenge').select({
        where: { userId: clientId },
        noDeletedCheck: true,
        orderBy: {
          fields: ['finishedAt'],
          order: 'ASC',
        },
      });
      if (result.rows.length > 0) {
        const records = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          records
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        records: []
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  }
});
