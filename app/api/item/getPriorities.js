({
  method: () => ({
    ...httpResponses.success(),
    body: { priorities: ['low', 'medium', 'high', 'none', 'optional'] }
  }),
});
