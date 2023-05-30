declare namespace responseType {
  interface Response {
    code: number;
    body: object;
    error?: object;
  }

  function success (): Response;
  function unauthorized (): Response;
}
