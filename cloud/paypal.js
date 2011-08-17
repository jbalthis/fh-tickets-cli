var API_STD_PARAMS = [
  {name: 'VERSION', value: '63.0'},
  {name: 'USER', value: "skalee_1312461335_biz_api1.gmail.com"},
  {name: 'PWD', value: "1312461375"},
  {name: 'SIGNATURE', value: "AFcWxV21C7fd0v3bYYYRCpSSRl31A3a7vMmHXJAJHHhlsK-5OAyyuu9b"}
];


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



var priceParams = function () {
  return [
    {name: 'PAYMENTREQUEST_0_CURRENCYCODE', value: "EUR"},
    {name: 'PAYMENTREQUEST_0_AMT', value: "10"}
  ];
};



var tryCommunicatingWithPayPal = function (params, triesLeft) {
  if (triesLeft === 0) { return false; }

  var response = $fh.web({
    url: "https://api-3t.sandbox.paypal.com/nvp",
    method: 'POST',
    charset: 'UTF-8',
    contentType: 'text/plain',
    params: params,
    headers: [],
    cookies: [],
    period: 4000
  });

  return (response.body ? response.body : tryCommunicatingWithPayPal(params, triesLeft - 1));
};

