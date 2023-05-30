({
  access: 'public',
  method: () => ({
    ...responseType.success(),
    body: lib.client.api.get(),
  }),
});
