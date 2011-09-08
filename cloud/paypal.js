var API_STD_PARAMS = [
  {name: 'VERSION', value: '74.0'},
  {name: 'USER', value: "skalee_1312461335_biz_api1.gmail.com"},
  {name: 'PWD', value: "1312461375"},
  {name: 'SIGNATURE', value: "AFcWxV21C7fd0v3bYYYRCpSSRl31A3a7vMmHXJAJHHhlsK-5OAyyuu9b"}
];

var priceVIP = 300;
var priceA = 30;
var priceB = 10;

var closeWindowResponse = function(response) {
  response.setContentType('text/html');
  response.setContent('<!DOCTYPE html><html><head><title></title><script type="text/javascript">window.close();</script></head><body></body></html>');
};


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



var priceParams = function (ticketsVIP, ticketsA, ticketsB) {
  //Okay, this could be more concise, but I wanted to make it as plain and simple as possible. Even for price of redundant code.
  var params = [
    {name: 'PAYMENTREQUEST_0_CURRENCYCODE', value: "EUR"},
    {name: 'PAYMENTREQUEST_0_AMT', value: ticketsVIP * priceVIP + ticketsA * priceA + ticketsB * priceB}
  ];

  var m = 0;
  if (ticketsVIP > 0) {
    params.push({name: "L_PAYMENTREQUEST_0_NAME" + m, value: "VIP Sector tickets"});
    params.push({name: "L_PAYMENTREQUEST_0_QTY"  + m, value: ticketsVIP});
    params.push({name: "L_PAYMENTREQUEST_0_AMT"  + m, value: priceVIP});
    m++;
  }
  if (ticketsA > 0) {
    params.push({name: "L_PAYMENTREQUEST_0_NAME" + m, value: "Sector A tickets"});
    params.push({name: "L_PAYMENTREQUEST_0_QTY"  + m, value: ticketsA});
    params.push({name: "L_PAYMENTREQUEST_0_AMT"  + m, value: priceA});
    m++;
  }
  if (ticketsB > 0) {
    params.push({name: "L_PAYMENTREQUEST_0_NAME" + m, value: "Sector B tickets"});
    params.push({name: "L_PAYMENTREQUEST_0_QTY"  + m, value: ticketsB});
    params.push({name: "L_PAYMENTREQUEST_0_AMT"  + m, value: priceB});
    m++;
  }

  return params;
};



var tryCommunicatingWithPayPal = function (params) {
  var response = $fh.web({
    url: "https://api-3t.sandbox.paypal.com/nvp",
    method: 'POST',
    charset: 'UTF-8',
    contentType: 'text/plain',
    params: params,
    headers: [],
    cookies: [],
    period: 8000,
    timeout: 8000
  });

  $fh.log('debug', '=======');
  $fh.log('debug', params.filter(function(x) { return (x.name == 'METHOD'); }));
  $fh.log('debug', response);
  if (response.body) {
    return decodePayPalResponse(response.body);
  } else {
    return false;
  }
};

var saveToCache = function(token, object) {
  var cacheResult = $fh.cache({
    act: 'save',
    key: token,
    val: object,
    expire: 3600
  });
  return (cacheResult.result == 'ok');
};

var loadFromCache = function(token) {
  var cached = $fh.cache({
    act: 'load',
    key: token
  });

  if (cached.result !== 'ok') {
    $fh.log('warn', 'Could not restore payment details from cache.');
    return null;
  } else {
    return $fh.parse(cached.val);
  }
};

var deleteFromCache = function(token) {
};

var userAcceptsOrDenies = function(token, newStatus) {
  var storedDetails = loadFromCache(token);
  storedDetails.status = newStatus;
  saveToCache(token, storedDetails);
  $fh.log('debug', 'Should be saved = ' + $fh.stringify(storedDetails));
  $fh.log('debug', 'Actually saved = ' + $fh.stringify(loadFromCache(token)));

  closeWindowResponse($response);
};

