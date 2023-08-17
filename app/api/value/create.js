({
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const createdAt = await domain.getLocalTime(clientId);    
      const result = await crud('ItemValue').create([{ ...records, createdAt }]);
      const [ value ] = result.rows;
      return responseType.modifiedBodyTemplate(responseType.created, {
        valueId: value.id
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
