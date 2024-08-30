({
  method: async ({ clientId, id }) => {
    try {
      const result = await crud('Item').select({ where: { sectionId: id } });
      if (result.rows.length > 0) {
        return {
          ...responseType.error(),
          body: 'Unable to delete: being used by Items',
        };
      }

      const deletedAt = await domain.getLocalTime(clientId);
      await crud('ItemSection').update({
        id,
        fields: { deletedAt, updatedAt: deletedAt }
      });

      return responseType.deleted();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
