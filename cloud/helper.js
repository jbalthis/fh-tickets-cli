function trySettingUpTransaction(triesLeft) {
  if (triesLeft === 0) return false;


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

  return (response.body ? decodePayPalResponse(response.body) : trySettingUpTransaction(triesLeft - 1));
}

