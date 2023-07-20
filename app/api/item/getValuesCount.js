({
  method: async ({ id }) => {
    try {
      const valuesCount = await crud('ItemValue').count('itemId', [id]);
      return responseType.modifiedBodyTemplate(responseType.success, {
        count: parseInt(valuesCount)
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});