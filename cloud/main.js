/*
 * Translates strings like %2d to their ASCII equivalents (dash in this case)
 */
var replaceAsciiHexCodeWithActualCharacter = function (str) {
  return String.fromCharCode(parseInt(str.substr(1), 16));
};

/*
 * Example PayPal response is "TOKEN=EC%2d8F209971RX095473U&TIMESTAMP=2011%2d08%2d03T16%3a38%3a20Z&CORRELATIONID=6befc7bb32e04&ACK=Success&VERSION=63%2e0&BUILD=2020243"
 * We want to decode it into JavaScript object for more convenient access.
 *
 * In order to do so, we:
 * 1. Split string on &
 * 2. Split each element on =
 * 3. Restore escaped ASCII sequences
 */
var decodePayPalResponse = function (response) {
  var decoded = {};
  response
    .split('&')
    .map(function (keyval) {
      return keyval.split('=');
    }).forEach(function (pair) {
      decoded[pair[0]] = pair[1].replace(/%[A-Za-z0-9]{2}/g, replaceAsciiHexCodeWithActualCharacter);
    });
  return decoded;
};

var failWithMessage = function (msg) {
  $fh.log('error', msg);
  return ({'status': 'error', message: msg});
};

/*---*/
/*
function pFetchConfig() {
  var configuration = [
    {name: 'VERSION', value: '63.0'},
    {name: 'USER', value: "skalee_1312461335_biz_api1.gmail.com"},
    {name: 'PWD', value: "1312461375"},
    {name: 'SIGNATURE', value: "AFcWxV21C7fd0v3bYYYRCpSSRl31A3a7vMmHXJAJHHhlsK-5OAyyuu9b"},
    {name: 'RETURNURL', value: $fh.util({'cloudUrl': 'pUserAccepts'}).cloudUrl},
    {name: 'CANCELURL', value: $fh.util({'cloudUrl': 'pUserDenies'}).cloudUrl},
    {name: 'METHOD', value: "SetExpressCheckout"},
    {name: 'PAYMENTREQUEST_0_CURRENCYCODE', value: "EUR"},
    {name: 'PAYMENTREQUEST_0_AMT', value: "100"}
  ];
  return {config: configuration};
}
*/
function trySettingUpTransaction(triesLeft) {
  if (triesLeft === 0) return false;

  var requestParams = [
    {name: 'VERSION', value: '63.0'},
    {name: 'USER', value: "skalee_1312461335_biz_api1.gmail.com"},
    {name: 'PWD', value: "1312461375"},
    {name: 'SIGNATURE', value: "AFcWxV21C7fd0v3bYYYRCpSSRl31A3a7vMmHXJAJHHhlsK-5OAyyuu9b"},
    {name: 'RETURNURL', value: $fh.util({'cloudUrl': 'pUserAccepts'}).cloudUrl},
    {name: 'CANCELURL', value: $fh.util({'cloudUrl': 'pUserDenies'}).cloudUrl},
    {name: 'METHOD', value: "SetExpressCheckout"},
    {name: 'PAYMENTREQUEST_0_CURRENCYCODE', value: "EUR"},
    {name: 'PAYMENTREQUEST_0_AMT', value: "100"}
  ];

  var response = $fh.web({
    url: "https://api-3t.sandbox.paypal.com/nvp",
    method: 'POST',
    charset: 'UTF-8',
    contentType: 'text/plain',
    params: requestParams,
    headers: [
    ],
    cookies: [
    ],
    period: 4000
  });

  return (response.body ? response : trySettingUpTransaction(triesLeft - 1));
}

function pSetPayment() {
  $fh.log('debug', 'User wants to pay for tickets');
  var response = trySettingUpTransaction(11);

  if (!response) { failWithMessage('Timeouts.'); }

  var decoded = decodePayPalResponse(response.body);
  $fh.log('debug', 'PayPal server responds with: ' + decoded);

  if (decoded.ACK !== 'Success') { failWithMessage('Some payment error.'); }

  return ({'status': 'ok', redirectUrl: "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + decoded.TOKEN});
}

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

function pUserAccepts() {
  $fh.log('info', 'User decides to pay');
  $fh.log('debug', 'Request came with params: ' + $fh.stringify($params));

  return {};
}

function pUserDenies() {
  $fh.log('info', 'User denies to pay');
  return {};
}

