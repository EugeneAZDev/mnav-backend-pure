({
  method: () => ({
    ...httpResponses.success(),
    body: { types: ['active', 'sport', 'other'] }
  }),
});
