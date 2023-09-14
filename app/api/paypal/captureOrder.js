/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
({
  method: async ({ clientId, orderId, userId }) => {
    try {
      if (clientId !== userId) {
        return responseType.modifiedBodyTemplate(responseType.error, {
          message: 'Unable to process payments',
        });
      }

      const { fetch } = common;
      const { base } = common.paypalConfig;
      const accessToken = await domain.paypal.generateAccessToken();
      const url = `${base}/v2/checkout/orders/${orderId}/capture`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
          // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
          // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
          // 'PayPal-Mock-Response':
          //   '{"mock_application_codes": "TRANSACTION_REFUSED"}',
          // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
        },
      });

      const body = await res.json();
      const errorDetail = body?.details?.[0];

      if (errorDetail) {
        const errorMessage =
          errorDetail &&
          `${errorDetail.issue} ${errorDetail.description} (${body.debug_id})`;

        const modifiedResponseError = responseType.modifiedBodyTemplate(
          responseType.error,
          {
            message: errorDetail.issue,
          },
        );
        return {
          ...modifiedResponseError,
          error: `Error [clientId #${clientId}]: ${errorMessage}`,
        };
      }

      return responseType.modifiedBodyTemplate(responseType.success, {
        body,
      });
    } catch (error) {
      return { ...responseType.error(), error };
    }
  },
});
