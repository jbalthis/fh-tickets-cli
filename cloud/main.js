var priceParams, API_STD_PARAMS, tryCommunicatingWithPayPal, $params;

function pSetPayment() {
  $fh.log('debug', '*****************************');
  $fh.log('debug', 'User wants to pay for tickets');

  var requestParams = [
    {name: 'RETURNURL', value: $fh.util({'cloudUrl': 'pUserAccepts'}).cloudUrl},
    {name: 'CANCELURL', value: $fh.util({'cloudUrl': 'pUserDenies'}).cloudUrl},
    {name: 'METHOD', value: "SetExpressCheckout"}
  ].concat(priceParams()).concat(API_STD_PARAMS);

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

  return ({'status': 'ok', redirectUrl: "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + response.TOKEN});
}


function pUserAccepts() {
  $fh.log('debug', '*****************************');
  $fh.log('debug', 'Customer has accepted the payment. Request came with params: ' + $fh.stringify($params));

  var token = $params.token;
  var payerID = $params.PayerID;

  var detailsParams = API_STD_PARAMS.concat([
    {name: 'METHOD', value: 'GetExpressCheckoutDetails'},
    {name: 'TOKEN', value: token}
  ]);
  var detailsResponse = tryCommunicatingWithPayPal(detailsParams, 9);

  $fh.log('debug', 'On request of customer\' details, PayPal responded with: ' + $fh.stringify(detailsResponse));

  if (detailsResponse.ACK !== 'Success') {
    $fh.log('error', '[CID:' + detailsResponse.CORRELATIONID + '] Some payment error.');
    return ({'status': 'error'});
  }

  $fh.log('debug', 'We could verify user details right here (for example we may be delivering our prodcuts to selected countries only). If everything is ok we can finalize payment now.');

  var doParams = API_STD_PARAMS.concat(priceParams()).concat([
    {name: 'METHOD', value: 'DoExpressCheckoutPayment'},
    {name: 'PAYERID', value: payerID},
    {name: 'TOKEN', value: token}
  ]);

  var doResponse = tryCommunicatingWithPayPal(doParams, 9);

  $fh.log('debug', 'On finalization request, PayPal responded with: ' + $fh.stringify(doResponse));

  if (doResponse.ACK !== 'Success') {
    $fh.log('error', '[CID:' + doResponse.CORRELATIONID + '] Some payment error.');
    return ({'status': 'error'});
  }

  $fh.log('info', '[CID:' + doResponse.CORRELATIONID + '] And the buyer is ' + detailsResponse.FIRSTNAME + ' ' + detailsResponse.LASTNAME);

  return {'body': 'a'};
}

function pUserDenies() {
  $fh.log('info', 'User denies to pay');
  return {};
}


/****/


function oldPayment() {

  var ticketsAndPrices = [[$params.ticketsVIP, 300, "VIP Sector tickets"], [$params.ticketsA, 30, "Sector A tickets"], [$params.ticketsB, 10, "Sector B tickets"]];

  ticketsAndPrices.forEach(function (index) {
    requestParams.push(
      {name: "L_PAYMENTREQUEST_0_NAME" + index, value: this[2]}
    );
    requestParams.push(
      {name: "L_PAYMENTREQUEST_0_QTY" + index, value: this[0]}
    );
    if (this[0] > 0) {
      requestParams.push({name: "L_PAYMENTREQUEST_0_AMT" + index, value: this[1]});
    }
  });

}

