async (pool, paymentData) => {
  const email = paymentData.CUSTOMEREMAIL || paymentData.EMAIL_D;
  if (!email) throw new Error('Email not found');
  const dbUserRecords = await crud('User').select({
    fields: ['id', 'email'],
    where: { email },
  });
  const [user] = dbUserRecords.rows.length > 0 && dbUserRecords.rows;
  if (!user) throw new Error('Email not found');
  const stringForHash = common.serializeHashArray(paymentData).replace(/\+/g, ' ').replace('GMT ', 'GMT+');

  // const signatureMd5 = paymentData.HASH || '';
  const signatureSha2 = paymentData.SIGNATURE_SHA2_256 || '';
  // const signatureSha3 = paymentData.SIGNATURE_SHA3_256 || '';
  // const computedMD5Hash = common.generateMD5Token(
  //   common.PAYMENT_CONFIG.secretKey,
  //   stringForHash,
  // );
  const computed256Hash = common.generateSHA256Token(
    common.PAYMENT_CONFIG.secretKey,
    stringForHash,
  );
  // const computed3256Hash = common.generateSHA3256Token(
  //   common.PAYMENT_CONFIG.secretKey,
  //   stringForHash,
  // );

  // const validMD5Hash = computedMD5Hash === signatureMd5;
  const valid256Hash = computed256Hash === signatureSha2;
  // const valid3256Hash = computed3256Hash === signatureSha3;
  let responseDate = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);  
  responseDate = responseDate.slice(0, 8) + paymentData.IPN_DATE.slice(8, 10) + responseDate.slice(10);
  console.log('IPN_DATE', paymentData.IPN_DATE, responseDate);
  const arrayForResponseHash = {
    IPN_PID: paymentData['IPN_PID%5B%5D'],
    IPN_PNAME: paymentData['IPN_PNAME%5B%5D'],
    IPN_DATE: paymentData.IPN_DATE,
    DATE: paymentData.IPN_DATE,
  };

  const sourceHMAC = common.serializeHashArray(arrayForResponseHash).replace(/\+/g, ' ').replace('GMT ', 'GMT+');;
  /**
   * OR
      let sourceHMAC = '';
      let valueLengthInBytes;
      Similar to common.serializeHashArray
      Object.keys(arrayForResponseHash).forEach((key) => {
        valueLengthInBytes = common.byteLength(arrayForResponseHash[key].toString());
        if (valueLengthInBytes > 0) {
          sourceHMAC += valueLengthInBytes + arrayForResponseHash[key].toString();
        }
      }); 
   */
  
  // const md5Hash = common.generateMD5Token(
  //   common.PAYMENT_CONFIG.secretKey,
  //   sourceHMAC,
  // );
  const sha2Hash = common.generateSHA256Token(
    common.PAYMENT_CONFIG.secretKey,
    sourceHMAC,
  );
  // const sha3Hash = common.generateSHA3256Token(
  //   common.PAYMENT_CONFIG.secretKey,
  //   sourceHMAC,
  // )
  
  // const responseMD5String = `<EPAYMENT>${paymentData.IPN_DATE}|${md5Hash}</EPAYMENT>`;
  const responseSHA2tring = `<sig algo="sha256" date="${paymentData.IPN_DATE}">${sha2Hash}</sig>`;
  // const responseSHA3String = `<sig algo="sha3-256" date="${paymentData.IPN_DATE}">${sha3Hash}</sig>`;
  
  // console.log('String for hash', stringForHash);
  // console.log('\nvalidMD5Hash', validMD5Hash, '\nvalid256Hash', valid256Hash, '\nvalid3256Hash', valid3256Hash);
  // console.log('HMAC Source:', sourceHMAC);
  // console.log(responseSHA2tring, responseSHA3String);
  // console.log();
  if (!valid256Hash) console.warn('Hash is not valid, needs to be investigated');

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
    // !Warning: WHEN DEBUG THIS FILE THE LINE BELOW SHOULD BE COMMENTED OUT
    await api.user.sendEmail().method({
      clientId: user.id && parseInt(user.id),
      email,
      undefined,
      undefined,
      type: 'premium',
      inputLocale: user.locale,
    });
    console.log(
      // eslint-disable-next-line max-len
      `PAYMENT INFORMATION User id: ${user.id} Status: ${paymentData.ORDERSTATUS}`,
    );
  } else if (
    paymentData.ORDERSTATUS === 'PENDING' &&
    paymentData.GATEWAY_RESPONSE === 'General+issuer+decline'
  ) {    
    console.log(`Unable to process payment ID #${paymentId}: Decline reason!`);
  } else {
    console.log(`ID #${paymentId}; Status: ${paymentData.ORDERSTATUS}; Response: ${paymentData.GATEWAY_RESPONSE}`);
  }

  // return responseMD5String;
  return responseSHA2tring;
};
