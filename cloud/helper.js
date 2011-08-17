function trySettingUpTransaction(triesLeft) {
  if (triesLeft === 0) return false;


  var requestParams1 = [
    {name: 'RETURNURL', value: $fh.util({'cloudUrl': 'pUserAccepts'}).cloudUrl},
    {name: 'CANCELURL', value: $fh.util({'cloudUrl': 'pUserDenies'}).cloudUrl},
    {name: 'METHOD', value: "SetExpressCheckout"}
  ];

  $fh.log('debug', 't1');
  $fh.log('debug', requestParams1);
  $fh.log('debug', requestParams1.concat);
  $fh.log('debug', requestParams1.concat(priceParams()));
  $fh.log('debug', requestParams1.concat(priceParams()).concat(API_STD_PARAMS));
  $fh.log('debug', 't9');

  var requestParams = requestParams1.concat(priceParams()).concat(API_STD_PARAMS);

  $fh.log('debug', $fh.stringify(requestParams));

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
  }, function(res) {
    $fh.log('debug', 'tak na wszelki wypadek ' + res);
  });

  $fh.log('debug', response);
  return (response.body ? response : trySettingUpTransaction(triesLeft - 1));
}

