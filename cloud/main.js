/* global decodePayPalResponse:false API_STD_PARAMS:false */

function pSetPayment() {
  $fh.log('debug', 'User wants to pay for tickets');
  var response = trySettingUpTransaction(11);

  if (!response) {
    $fh.log('error', 'Timeouts.');
    return ({'status': 'error'});
  }

  $fh.log('debug', 'here');

  var decoded = decodePayPalResponse(response.body);
  $fh.log('debug', 'PayPal server responds with: ' + $fh.stringify(decoded));
  $fh.log('debug', 'Raw was: ' + response.body);

  if (decoded.ACK !== 'Success') {
    $fh.log('error', '[CID:' + json.CORRELATIONID + '] Some payment error.');
    return ({'status': 'error'});
  }

  return ({'status': 'ok', redirectUrl: "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + decoded.TOKEN});
}


function pUserAccepts() {
  $fh.log('debug', 'Customer has accepted the payment. Request came with params: ' + $fh.stringify($params));

  var token = $params.token;

  var responseDetails = $fh.web({
    url: "https://api-3t.sandbox.paypal.com/nvp",
    method: 'POST',
    charset: 'UTF-8',
    contentType: 'text/plain',
    params: API_STD_PARAMS.concat([
      {name: 'METHOD', value: 'GetExpressCheckoutDetails'},
      {name: 'TOKEN', value: token}
    ]),
    headers: [
    ],
    cookies: [
    ],
    period: 4000
  });

  $fh.log('debug', 'PayPal responded with user details: ' + $fh.stringify(responseDetails));
  var decodedDetails = decodePayPalResponse(responseDetails.body);
  $fh.log('debug', 'PayPal responded with user details: ' + $fh.stringify(decodedDetails));

  if (decodedDetails.ACK !== 'Success') {
    $fh.log('error', '[CID:' + decodedDetails.CORRELATIONID + '] Some payment error.');
    return ({'status': 'error'});
  }

  $fh.log('debug', 'We could verify user details right here (for example we may be delivering our prodcuts to selected countries only). If everything is ok we can finalize payment now.');

  var responseDo = $fh.web({
    url: "https://api-3t.sandbox.paypal.com/nvp",
    method: 'POST',
    charset: 'UTF-8',
    contentType: 'text/plain',
    params: API_STD_PARAMS.concat(priceParams()).concat([
      {name: 'METHOD', value: 'DoExpressCheckoutPayment'},
      {name: 'TOKEN', value: token}
    ]),
    headers: [],
    cookies: [],
    period: 4000
  });

  var decodedDo = decodePayPalResponse(responseDo.body);
  $fh.log('debug', 'PayPal responded to finalization request: ' + $fh.stringify(decodedDo));

  if (decodedDo.ACK !== 'Success') {
    $fh.log('error', '[CID:' + decodedDo.CORRELATIONID + '] Some payment error.');
    return ({'status': 'error'});
  }

  $fh.log('info', '[CID:' + decodedDetails.CORRELATIONID + '] And the buyer is ' + decodedDetails.FIRSTNAME + ' ' + decodedDetails.LASTNAME);

  return {};
}

function pUserDenies() {
  $fh.log('info', 'User denies to pay');
  return {};
}


/****/


function oldPayment() {

  var ticketsAndPrices = [[$params.ticketsVIP, 300, "VIP Sector tickets"], [$params.ticketsA, 30, "Sector A tickets"], [$params.ticketsB, 10, "Sector B tickets"]];

  ticketsAndPrices.forEach(function(index) {
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

