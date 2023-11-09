({
  method: async ({ clientId }) => {
    try {
      const result = await crud('Payment').select({
        fields: ['id', 'status'],
        orderBy: {
          fields: ['id'],
          order: 'DESC',
        },
        where: { userId: clientId },
      });

      if (result.rows.length > 0) {
        const [payment] = result.rows;
        return responseType.modifiedBodyTemplate(responseType.success, {
          status: payment.status,
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        status: undefined,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
