({
  access: 'public',
  method: () => ({
    ...responseType.success(),
    body: {
      version: common.API_VERSION,
    },
  }),
});
