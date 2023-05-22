({
  method: async () => {
    try {
      const sql = `
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type 
          WHERE typname = 'ValueType'
        );`;
      const result = await db().query(sql);
      if (result.rows.length > 0) {
        const types = result.rows.map((row) => row.enumlabel);
        return httpResponses.modifiedBodyTemplate(httpResponses.success, {
          types
        });
      }
      return httpResponses.modifiedBodyTemplate(httpResponses.success, {
        types: undefined
      });
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
