({
  method: async ({ clientId, id }) => {
    try {
      console.debug(
        `Client #${clientId} has been removed challengeId ${id}`
      );
      const sql = 'DELETE FROM "RecordChallenge" rc WHERE rc.id = $1;';
      await crud().query(sql, [id]);
      return responseType.deleted();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
