var API_STD_PARAMS = [
  {name: 'VERSION', value: '74.0'},
  {name: 'USER', value: "skalee_1312461335_biz_api1.gmail.com"},
  {name: 'PWD', value: "1312461375"},
  {name: 'SIGNATURE', value: "AFcWxV21C7fd0v3bYYYRCpSSRl31A3a7vMmHXJAJHHhlsK-5OAyyuu9b"}
];



var sectors = {
  A: {name: "Sector A", price: 30},
  B: {name: "Sector B", price: 10},
  VIP: {name: "VIP sector", price: 300}
};



var closeWindowResponse = function(response) {
  response.setContentType('text/html');
  response.setContent('<!DOCTYPE html><html><head><title></title><script type="text/javascript">window.close();</script></head><body><h1>You may close this window.</h1></body></html>');
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



var priceParams = function (tickets) {
  var ticketKeys = [];
  for(k in tickets) ticketKeys.push(k); // Object.keys(tickets) is not supported yet.

  var ticketsToSectors = ticketKeys
    .filter(function(k) { return sectors[k]; })
    .map(function(k) { return {number: tickets[t], sector: sectors[t]}; });
  var totalPrice = ticketsToSectors
    .reduce(function(subTotal, current) { return subTotal + current.number * current.sectors.price; });

  return ticketsToSectors
    .map(function(item, index) { //add payment details
      return [
        {name: "L_PAYMENTREQUEST_0_NAME" + index, value: item.sector.name},
        {name: "L_PAYMENTREQUEST_0_QTY"  + index, value: item.number}, //quantity
        {name: "L_PAYMENTREQUEST_0_AMT"  + index, value: item.sector.price} //item price
      ];
    })
    .concat([ //add some general params
      {name: 'PAYMENTREQUEST_0_CURRENCYCODE', value: "EUR"},
      {name: 'PAYMENTREQUEST_0_AMT', value: totalPrice}
    ])
    .reduce(function(flattened, elem) { return flattened.concat(elem); }, []); //flatten this array
};



var tryCommunicatingWithPayPal = function (params) {
  var response = $fh.web({
    url: "https://api-3t.sandbox.paypal.com/nvp",
    method: 'POST',
    charset: 'UTF-8',
    contentType: 'text/plain',
    params: params.concat(API_STD_PARAMS),
    headers: [],
    cookies: [],
    period: 8000,
    timeout: 8000
  });

  if (response.body) {
    var decoded = decodePayPalResponse(response.body);
    $fh.log('debug', 'PayPal responded with: {resp}'.replace("{resp}", $fh.stringify(decoded)));
    return decoded;
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



var userAcceptsOrDenies = function(token, newStatus) {
  var storedDetails = loadFromCache(token);
  storedDetails.status = newStatus;
  saveToCache(token, storedDetails);
  closeWindowResponse($response);
};

