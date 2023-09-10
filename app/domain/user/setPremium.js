async (pool, clientId, paymentData) => {
  const {
    id,
    orderID,
    payerID,
    paymentID,
    paymentSource,
    payment_source: {
      paypal: {
        email_address: email,
        name: { given_name, surname },
        address: { country_code: code },
      },
    },
    purchase_units: [
      {
        shipping: {
          address: {
            address_line_1: address,
            address_line_2: address2,
            admin_area_2: area,
            admin_area_1: area2,
            postal_code: postal,
          },
        },
        payments: {
          captures: [
            {
              seller_receivable_breakdown: {
                net_amount: { currency_code: currency, value: net },
                paypal_fee: { value: fee },
              },
            },
          ],
        },
      },
    ],
  } = paymentData;
  const fullName = `${given_name} ${surname}`;
  const createdPayment = await crud('Payment').create(
    [
      {
        address,
        address2,
        area,
        area2,
        code,
        currency,
        email,
        fee,
        fullName,
        net,
        orderId: orderID,
        payerId: payerID,
        paymentId: paymentID,
        postal,
        source: paymentSource,
        transactionId: id,
        userId: clientId,
      },
    ],
    pool,
  );
  const [payment] = createdPayment.rows;
  const premiumAt = await domain.getLocalTime(clientId);
  const premiumPeriod = 'month';
  await crud('User').update({
    id: clientId,
    fields: { premiumAt, premiumPeriod, autoDetailsUpdate: true },
    transaction: pool,
  });

  console.log(payment.id);

  responseType.modifiedBodyTemplate(responseType.created, {
    paymentId: payment.id,
  });
};
