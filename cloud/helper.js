function trySettingUpTransaction(triesLeft) {
  if (triesLeft === 0) return false;

  var requestParams = [
    {name: 'RETURNURL', value: $fh.util({'cloudUrl': 'pUserAccepts'}).cloudUrl},
    {name: 'CANCELURL', value: $fh.util({'cloudUrl': 'pUserDenies'}).cloudUrl},
    {name: 'METHOD', value: "SetExpressCheckout"}
  ].concat(priceParams()).concat(API_STD_PARAMS);

  var response = $fh.web({
    url: "https://api-3t.sandbox.paypal.com/nvp",
    method: 'POST',
    charset: 'UTF-8',
    contentType: 'text/plain',
    params: requestParams,
    headers: [],
    cookies: [],
    period: 4000
  });

  return (response.body ? response : trySettingUpTransaction(triesLeft - 1));
}

