({
  method: async ({ clientId }) => {
    try {
      const result = await crud('User').select({ id: clientId, fields: ['syncToMob', 'syncToServer'] });
      if (result.rows.length === 1) {
        const [ syncInfo ] = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          syncInfo,
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        syncInfo: undefined,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
