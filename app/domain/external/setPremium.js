async (pool, paymentData) => {
  const email = paymentData.CUSTOMEREMAIL || paymentData.EMAIL_D;
  if (!email) throw new Error('Email not found');
  const dbUserRecords = await crud('User').select({
    fields: ['id', 'email'],
    where: { email },
  });
  const [user] = dbUserRecords.rows.length > 0 && dbUserRecords.rows;
  if (!user) throw new Error('Email not found');
  const signatureSha2 = paymentData.SIGNATURE_SHA2_256 || '';
  const stringForHash = common.serializeHashArray(paymentData).replace(/\+/g, ' ').replace('GMT ', 'GMT+');
  const computedHash = common.generateSHA256Token(
    common.PAYMENT_CONFIG.secretKey,
    stringForHash,
  );
  const validHash = computedHash === signatureSha2;
  console.debug('validHash', validHash);
  if (!validHash) console.error(`Invalid cache for ${email}`, error);
  const responseDate = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const IPN_PNAME = paymentData['IPN_PNAME%5B%5D'].replace(/\+/g, ' ');
  const payload = {
    IPN_PID: paymentData['IPN_PID%5B%5D'],
    IPN_PNAME: IPN_PNAME,
    IPN_DATE: paymentData.IPN_DATE,
    DATE: responseDate, // paymentData.IPN_DATE,
  };
  // console.log('payload', payload);
  const arrayForResponseHash = [
    paymentData['IPN_PID%5B%5D'][0], IPN_PNAME, paymentData.IPN_DATE, responseDate
  ];
  // console.debug('arrayForResponseHash', arrayForResponseHash);
  const stringForResponseHash = common.serializeHashArray(arrayForResponseHash);  
  const responseHash = common.generateSHA256Token(
    common.PAYMENT_CONFIG.secretKey,
    stringForResponseHash,
  );
  const payment = await crud('Payment').select({
    fields: ['id'],
    where: { paymentId: paymentData.REFNO },
    transaction: pool,
  });
  const paymentId = payment.rows.length === 1 && payment.rows[0].id;
  if (!paymentId) {
    const paymentRecords = {
      address: paymentData.ADDRESS1 || paymentData.ADDRESS1_D,
      address2: paymentData.ADDRESS2 || paymentData.ADDRESS2_D,
      area: paymentData.IPCOUNTRY || paymentData.COUNTRY || paymentData.COUNTRY_D,
      area2: paymentData.STATE || paymentData.STATE_D,
      code: paymentData.COUNTRY_CODE || paymentData.COUNTRY_D_CODE,
      currency: paymentData.PAYOUT_CURRENCY || paymentData.CURRENCY,
      email,
      fee: paymentData.IPN_COMMISSION && parseFloat(paymentData.IPN_COMMISSION),
      fullName:
        paymentData.FIRSTNAME && paymentData.LASTNAME && `${paymentData.FIRSTNAME} ${paymentData.LASTNAME}`,
      net: paymentData.PAYABLE_AMOUNT && parseFloat(paymentData.PAYABLE_AMOUNT),
      orderId: paymentData.ORDERNO,
      payerIP: paymentData.IPADDRESS,
      paymentId: paymentData.REFNO,
      postal: paymentData.ZIPCODE || paymentData.ZIPCODE_D,
      source: paymentData.PAYMETHOD,
      status: paymentData.ORDERSTATUS,
      transactionId: paymentData.MESSAGE_ID,
      userId: user.id && parseInt(user.id),
      details: JSON.stringify(paymentData),
    };
    await crud('Payment').create([paymentRecords], pool);
  } else {
    await crud('Payment').update({
      id: paymentId,
      fields: { status: paymentData.ORDERSTATUS, updatedAt: new Date() },
      transaction: pool,
    });
  };
  if (paymentData.ORDERSTATUS === 'COMPLETE') {
    const premiumAt = await domain.getLocalTime(user.id);
    const premiumPeriod = 'month';
    await crud('User').update({
      id: user.id,
      fields: { premiumAt, premiumPeriod, autoDetailsUpdate: true },
      transaction: pool,
    });
    // TODO UNCOMMENT LINE
    // await api.user.sendEmail().method({
    //   clientId: user.id && parseInt(user.id),
    //   email,
    //   undefined,
    //   undefined,
    //   type: 'premium',
    //   inputLocale: user.locale,
    // });
  };
  console.log(
    // eslint-disable-next-line max-len
    `PAYMENT INFORMATION User id: ${user.id} Status: ${paymentData.ORDERSTATUS}`,
  );
  const responseString = `<sig algo="sha256" date="${responseDate}">${responseHash}</sig>`;
  return responseString;// `<EPAYMENT>${data.IPN_DATE}|${hash}</EPAYMENT>`;
};
