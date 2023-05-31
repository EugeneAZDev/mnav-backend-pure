({
  method: async ({ clientId }) => {
    try {
      const buffer = await lib.excel.createExcelFile(clientId);
      return {
        ...responseType.success(),
        extraHeaders: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename=MyActivities.xlsx',
        },
        buffer,
      };
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
