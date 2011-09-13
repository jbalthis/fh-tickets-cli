function pSetPayment() {

  $fh.log('debug', '*****************************');
  $fh.log('debug', '*****************************');
  $fh.log('debug', '*****************************');
  var tickets = $params.tickets;

  $fh.log('debug', 'User wants to pay for {VIP} tickets to VIP sector, {A} to Sector A and {B} to Sector B.'.replace('{A}', tickets.A).replace('{B}', tickets.B).replace('{VIP}', tickets.VIP));

  var requestParams = priceParams(tickets)
    .concat([
      {name: 'RETURNURL', value: $fh.util({'cloudUrl': 'pUserAccepts'}).cloudUrl},
      {name: 'CANCELURL', value: $fh.util({'cloudUrl': 'pUserDenies'}).cloudUrl},
      {name: 'METHOD', value: "SetExpressCheckout"}
    ]);

  var response = tryCommunicatingWithPayPal(requestParams);

  if (!response) {
    $fh.log('error', 'Timeouts when trying to set up payment.');
    return ({'status': 'error'});
  }

  $fh.log('debug', 'For setting up payment, PayPal server responds with: ' + $fh.stringify(response));

  if (response.ACK !== 'Success') {
    $fh.log('error', '[CID:' + response.CORRELATIONID + '] Some payment error.');
    return ({'status': 'error'});
  }

  if (!saveToCache(response.TOKEN, {'ticketsVIP': ticketsVIP, 'ticketsA': ticketsA, 'ticketsB': ticketsB, 'status': 'pending'})) {
    $fh.log('error', '[CID:' + response.CORRELATIONID + '] Could not cache transaction details.');
    return ({'status': 'error'});
  }

  return ({'status': 'ok', token: response.TOKEN, redirectUrl: "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + response.TOKEN});
}

function pRetrievePayerDetails() {
  $fh.log('debug', '*****************************');
  $fh.log('debug', 'Retrieve Payer Details. Request came with params: {params}'.replace('{params}', $fh.stringify($params)));
  var token = $params.token;
  var storedDetails = loadFromCache(token);

  var resp = {};
  switch (storedDetails.status) {
    case 'accepted':
      var detailsParams = API_STD_PARAMS.concat([
        {name: 'METHOD', value: 'GetExpressCheckoutDetails'},
        {name: 'TOKEN', value: token}
      ]);
      var detailsResponse = tryCommunicatingWithPayPal(detailsParams);

      $fh.log('debug', "On request for customer's details, PayPal responded with: {response}".replace("{response}", $fh.stringify(detailsResponse)));

      if (detailsResponse.ACK !== 'Success') {
        $fh.log('error', '[CID: {CID}] Some error when retrieving payment details.'.replace("{CID}", detailsResponse.CORRELATIONID));
        return ({'status': 'error'});
      }

      $fh.log('debug', "We could verify user details right here (for example we may be delivering our prodcuts to selected countries only). But we will only grab some of payer's details.");
      storedDetails.customer = "{first} {last}"
        .replace("{first}", detailsResponse.FIRSTNAME)
        .replace("{last}", detailsResponse.LASTNAME);
      storedDetails.payerID = detailsResponse.PAYERID;
      saveToCache(token, storedDetails);

      return ({status: 'ok', token: token});

    case 'cancelled':
      return ({status: 'ok', stop: 'User cancelled payment'});

    default:
      $fh.log('debug', "User haven't decided so far.");
      return ({status: 'error', delay: 1000});
  }
}

function pFinalizePayment() {
  $fh.log('debug', '*****************************');
  $fh.log('debug', 'Finalizing Payment. Request came with params: ' + $fh.stringify($params));
  var token = $params.token;
  var storedDetails = loadFromCache(token);

  var doParams = priceParams(storedDetails.tickets)
    .concat([
      {name: 'METHOD', value: 'DoExpressCheckoutPayment'},
      {name: 'PAYERID', value: storedDetails.payerID},
      {name: 'TOKEN', value: token}
    ]);

  var doResponse = tryCommunicatingWithPayPal(doParams);

  if (doResponse.ACK !== 'Success') {
    $fh.log('error', '[CID: {CID}] Some payment error when trying to complete payment.'.replace('CID', doResponse.CORRELATIONID));
    return ({'status': 'error'});
  }

  $fh.log('info', '[CID: {CID}] And the buyer is {customer}'
      .replace("{customer}", storedDetails.customer)
      .replace("{CID}", doResponse.CORRELATIONID));

  return ({status: 'ok', customer: storedDetails.customer, tickets: storedDetails.tickets});
}

function pUserDenies() {
  $fh.log('debug', '*****************************');
  $fh.log('info', 'User denies to pay. Request came with params: ' + $fh.stringify($params));
  var token = $params.token;
  userAcceptsOrDenies(token, 'cancelled');
}
function pUserAccepts() {
  $fh.log('debug', '*****************************');
  $fh.log('debug', 'Customer has accepted the payment. Request came with params: ' + $fh.stringify($params));

  var token = $params.token;
  // var payerID = $params.PayerID; // We are obtaining payerID in pRetrievePayerDetails() but you can get it also this way if you want.

  userAcceptsOrDenies(token, 'accepted');
}

