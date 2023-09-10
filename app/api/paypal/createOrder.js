({
  method: async ({ clientId, service }) => {
    try {
      const { fetch } = common;
      const { base } = common.paypalConfig;
      const accessToken = await domain.paypal.generateAccessToken();
      const url = `${base}/v2/checkout/orders`;
      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: service.cost,
            },
          },
        ],
      };

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
          // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
          // 'PayPal-Mock-Response':
          //   '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}',
          // 'PayPal-Mock-Response':
          //   '{"mock_application_codes": "PERMISSION_DENIED"}',
          // 'PayPal-Mock-Response':
          //   '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}',
        },
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const orderData = await res.json(); // { id, status : 'CREATED }
      if (orderData.id) {
        return responseType.modifiedBodyTemplate(responseType.success, {
          orderId: orderData.id,
          userId: clientId,
        });
      } else {
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail ?
          `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})` :
          JSON.stringify(orderData);

        const modifiedResponseError = responseType.modifiedBodyTemplate(
          responseType.error,
          {
            message: errorDetail.issue,
          },
        );
        return {
          ...modifiedResponseError,
          error: `Error [userId #${userId}]: ${errorMessage}`,
        };
      }
    } catch (error) {
      console.log(error);
      return { ...responseType.error(), error };
    }
  },
});
