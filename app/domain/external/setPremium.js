async (pool, paymentData) => {
  const data = common.removeEmptyValues(paymentData);
  const email = data.CUSTOMEREMAIL || data.EMAIL_D;
  if (!email) throw new Error('Email not found');
  const dbUserRecords = await crud('User').select({
    fields: ['id', 'email'],
    where: { email },
  });
  const [user] = dbUserRecords.rows.length > 0 && dbUserRecords.rows;
  if (!user) throw new Error('Email not found');

  let hashString = '';
  let valueLengthInBytes;
  const payload = {
    IPN_PID: data['IPN_PID%5B%5D'],
    IPN_PNAME: data['IPN_PNAME%5B%5D'].replace(/\+/g, ' '),
    IPN_DATE: paymentData.IPN_DATE,
    DATE: paymentData.IPN_DATE,
  };
  Object.keys(payload).forEach((key) => {
    valueLengthInBytes = common.byteLength(payload[key].toString());
    if (valueLengthInBytes > 0) {
      hashString += valueLengthInBytes + payload[key].toString();
    }
  });
  const hash = common.generateMD5Token(
    common.PAYMENT_CONFIG.secretKey,
    hashString,
  );

  const payment = await crud('Payment').select({
    fields: ['id'],
    where: { paymentId: data.REFNO },
    transaction: pool,
  });

  const paymentId = payment.rows.length === 1 && payment.rows[0].id;

  if (!paymentId) {
    const paymentRecords = {
      address: data.ADDRESS1 || data.ADDRESS1_D,
      address2: data.ADDRESS2 || data.ADDRESS2_D,
      area: data.IPCOUNTRY || data.COUNTRY || data.COUNTRY_D,
      area2: data.STATE || data.STATE_D,
      code: data.COUNTRY_CODE || data.COUNTRY_D_CODE,
      currency: data.PAYOUT_CURRENCY || data.CURRENCY,
      email,
      fee: data.IPN_COMMISSION && parseFloat(data.IPN_COMMISSION),
      fullName:
        data.FIRSTNAME && data.LASTNAME && `${data.FIRSTNAME} ${data.LASTNAME}`,
      net: data.PAYABLE_AMOUNT && parseFloat(data.PAYABLE_AMOUNT),
      orderId: data.ORDERNO,
      payerIP: data.IPADDRESS,
      paymentId: data.REFNO,
      postal: data.ZIPCODE || data.ZIPCODE_D,
      source: data.PAYMETHOD,
      status: data.ORDERSTATUS,
      transactionId: data.MESSAGE_ID,
      userId: user.id && parseInt(user.id),
      details: JSON.stringify(data),
    };
    await crud('Payment').create([paymentRecords], pool);
  } else {
    await crud('Payment').update({
      id: paymentId,
      fields: { status: data.ORDERSTATUS, updatedAt: new Date() },
      transaction: pool,
    });
  }

  if (data.ORDERSTATUS === 'COMPLETE') {
    const premiumAt = await domain.getLocalTime(user.id);
    const premiumPeriod = 'month';
    await crud('User').update({
      id: user.id,
      fields: { premiumAt, premiumPeriod, autoDetailsUpdate: true },
      transaction: pool,
    });
  }

  console.log(
    // eslint-disable-next-line max-len
    `PAYMENT INFORMATION User id: ${user.id} Status: ${data.ORDERSTATUS}`,
  );

  return `<EPAYMENT>${data.IPN_DATE}|${hash}</EPAYMENT>`;
};
