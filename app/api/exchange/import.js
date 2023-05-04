({
  method: async () => {
    try {
      console.log('Worked!');
      return httpResponses.success();
    } catch (error) {
      return { ...httpResponses.error(), error };
    }
  },
});
