declare namespace httpResponses {
  interface HttpResponse {
    code: number;
    body: object;
    error?: object;
  }

  function success (): HttpResponse;
  function unauthorized (): HttpResponse;
}
