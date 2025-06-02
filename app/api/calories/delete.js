({
  method: async ({ clientId, id }) => {
    try {
      console.debug(
        `Client #${clientId} has been removed caloriesId ${id}`
      );
      const sql = 'DELETE FROM "Calories" v WHERE v.id = $1;';
      await crud().query(sql, [id]);
      return responseType.deleted();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
