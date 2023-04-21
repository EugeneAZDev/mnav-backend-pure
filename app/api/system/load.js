({
  access: 'public',
  method: () => ({ ...httpResponses.success(), body: structure.getClientApi() })
});
