({
  method: async ({ clientId }) => {
    try {
      const result = await crud('ItemSection').select({
        where: { userId: clientId },
      });
      if (result.rows.length > 0) {
        const sections = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          sections,
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        sections: [],
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
