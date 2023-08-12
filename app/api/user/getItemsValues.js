({
  method: async ({ userId }) => {
    try {
      const result = await crud('Item').select({ where: { userId } });
      if (result.rows.length > 0) {
        const items = result.rows;
        const rawValues = await crud('ItemValue').select({
          where: { itemId: [...items.map((r) => r.id)] },
        });
        if (result.rows.length > 0) {
          const resultSet = items.reduce((acc, item) => {
            const values = rawValues.rows.filter(
              (value) => value.itemId === item.id,
            );
            acc.push({
              ...item,
              values,
            });
            return acc;
          }, []);
          return responseType.modifiedBodyTemplate(responseType.success, {
            items: resultSet,
          });
        }
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        items: [],
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
