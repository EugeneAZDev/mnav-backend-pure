({
  // eslint-disable-next-line no-unused-vars
  method: async ({ clientId, ...records }) => {
    try {
      const details = await crud('ValueDetail').find('itemId', [records.itemId]);      
      const result = await crud('ItemValue').create([{ ...records }]);
      const [ value ] = result.rows;
      const { itemId, createdAt } = value
      const detail = {
          itemId: itemId,
          latestValueAt: createdAt
      }
      if (details.rows.length) {
        const existingRec = details.rows[0]
        await crud('ValueDetail').update( existingRec.id, detail);
      } else await crud('ValueDetail').create([detail])
      
      return responseType.modifiedBodyTemplate(responseType.created, {
        valueId: value.id
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
