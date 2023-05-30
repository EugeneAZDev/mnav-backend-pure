({
  method: async () => {
    try {
      console.log('Worked!');
      return responseType.success();
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
