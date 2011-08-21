var priceParams, API_STD_PARAMS, tryCommunicatingWithPayPal, $params;

function pSetPayment() {

  $fh.log('debug', '*****************************');
  var
    ticketsVIP = $params.ticketsVIP,
    ticketsA = $params.ticketsA,
    ticketsB = $params.ticketsB;
  $fh.log('debug', 'User wants to pay for following tickets: ' + ticketsVIP + ' to VIP sector, ' + ticketsA + ' to Sector A, ' + ticketsB + ' to Sector B.');

  var requestParams = [
    {name: 'RETURNURL', value: $fh.util({'cloudUrl': 'pUserAccepts'}).cloudUrl},
    {name: 'CANCELURL', value: $fh.util({'cloudUrl': 'pUserDenies'}).cloudUrl},
    {name: 'METHOD', value: "SetExpressCheckout"}
  ].concat(priceParams(ticketsVIP, ticketsA, ticketsB)).concat(API_STD_PARAMS);

  var response = tryCommunicatingWithPayPal(requestParams, 9);

  if (!response) {
    $fh.log('error', 'Timeouts.');
    return ({'status': 'error'});
  }

  $fh.log('debug', 'For setting up payment, PayPal server responds with: ' + $fh.stringify(response));

  if (response.ACK !== 'Success') {
    $fh.log('error', '[CID:' + response.CORRELATIONID + '] Some payment error.');
    return ({'status': 'error'});
  }

  if ($fh.cache({
    act: 'save',
    key: response.TOKEN,
    val: [ticketsVIP, ticketsA, ticketsB].join(','),
    expire: 3600
  }).result !== 'ok') {
    $fh.log('error', '[CID:' + response.CORRELATIONID + '] Could not cache transaction details.');
    return ({'status': 'error'});
  }

  return ({'status': 'ok', redirectUrl: "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + response.TOKEN});
}


function pUserAccepts() {
  $fh.log('debug', '*****************************');
  $fh.log('debug', 'Customer has accepted the payment. Request came with params: ' + $fh.stringify($params));

  var token = $params.token;
  var payerID = $params.PayerID;

  var cachedParams = $fh.cache({
    act: 'load',
    key: token
  });
  $fh.log('debug', 'Cache was: ' + $fh.stringify(cachedParams));
  if (cachedParams.result !== 'ok') {
    $fh.log('error', 'Could not restore payment details from cache.');
    return ({'status': 'error'});
  }
  var cachedParamsSplitted = cachedParams.val.split(',');
  var
    ticketsVIP = cachedParamsSplitted[0],
    ticketsA = cachedParamsSplitted[1],
    ticketsB = cachedParamsSplitted[2];
  $fh.log('debug', 'Cache was: ' + $fh.stringify(cachedParamsSplitted));

  var detailsParams = API_STD_PARAMS.concat([
    {name: 'METHOD', value: 'GetExpressCheckoutDetails'},
    {name: 'TOKEN', value: token}
  ]);
  var detailsResponse = tryCommunicatingWithPayPal(detailsParams, 9);

  $fh.log('debug', 'On request of customer\' details, PayPal responded with: ' + $fh.stringify(detailsResponse));

  if (detailsResponse.ACK !== 'Success') {
    $fh.log('error', '[CID:' + detailsResponse.CORRELATIONID + '] Some error when retrieving payment details.');
    return ({'status': 'error'});
  }

  $fh.log('debug', 'We could verify user details right here (for example we may be delivering our prodcuts to selected countries only). If everything is ok we can finalize payment now.');

  var doParams = API_STD_PARAMS.concat(priceParams(ticketsVIP, ticketsA, ticketsB)).concat([
    {name: 'METHOD', value: 'DoExpressCheckoutPayment'},
    {name: 'PAYERID', value: payerID},
    {name: 'TOKEN', value: token}
  ]);

  var doResponse = tryCommunicatingWithPayPal(doParams, 9);

  $fh.log('debug', 'On finalization request, PayPal responded with: ' + $fh.stringify(doResponse));

  if (doResponse.ACK !== 'Success') {
    $fh.log('error', '[CID:' + doResponse.CORRELATIONID + '] Some payment error when trying to complete payment.');
    return ({'status': 'error'});
  }

  $fh.log('info', '[CID:' + doResponse.CORRELATIONID + '] And the buyer is ' + detailsResponse.FIRSTNAME + ' ' + detailsResponse.LASTNAME);

  return {'body': 'a'};
}

function pUserDenies() {
  $fh.log('info', 'User denies to pay');
  return {};
}

