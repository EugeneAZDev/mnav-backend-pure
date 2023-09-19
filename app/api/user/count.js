({
  method: async () => {
    try {
      const count = await crud('User').select({ count: 'id' });
      return responseType.modifiedBodyTemplate(responseType.success, {
        count,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
