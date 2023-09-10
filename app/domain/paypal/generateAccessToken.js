/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
async () => {
  try {
    const { Buffer, fetch } = common;
    const { base, clientId, clientSecret } = common.paypalConfig;
    if (!clientId || !clientSecret) {
      throw new Error('MISSING_API_CREDENTIALS');
    }
    const auth = Buffer.from(clientId + ':' + clientSecret).toString('base64');
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    const data = await response.json();

    return data.access_token;
  } catch (error) {
    console.error('Failed to generate Access Token:', error);
  }
};
