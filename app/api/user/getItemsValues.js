({
  method: async ({ userId }) => {
    try {
      const result = await db('Item').find('userId', [userId]);
      if (result.rows.length > 0) {
        const items = result.rows;
        const rawValues = await db('ItemValue').find('itemId', [
          ...items.map((r) => r.id),
        ]);
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
          return httpResponses.modifiedBodyTemplate(httpResponses.success, {
            items: resultSet
          });
        }
      }
      return httpResponses.modifiedBodyTemplate(httpResponses.success, {
        items: []
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
