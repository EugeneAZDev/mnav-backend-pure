({
  method: async ({ clientId, statsId }) => {
    try {
      console.debug(`Client #${clientId} has been removed statsId ${statsId}`);
      const sql = 'DELETE FROM "View" v WHERE v.id = $1;';
      await crud().query(sql, [statsId]);
      return responseType.deleted();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
