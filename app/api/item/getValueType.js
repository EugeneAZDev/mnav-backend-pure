({
  method: async () => {
    try {
      const sql = `
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid FROM pg_type 
          WHERE typname = 'ValueType'
        );`;
      const result = await crud().query(sql);
      if (result.rows.length > 0) {
        const types = result.rows.map((row) => row.enumlabel);
        return responseType.modifiedBodyTemplate(responseType.success, {
          types
        });
      }
      return responseType.modifiedBodyTemplate(responseType.success, {
        types: undefined
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
