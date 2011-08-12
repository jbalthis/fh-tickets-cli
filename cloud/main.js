function pSetPayment() {
  var requestParams = [
    {name: 'VERSION', value: '63.0'},
    {name: 'USER', value: "skalee_1312461335_biz_api1.gmail.com"},
    {name: 'PWD', value: "1312461375"},
    {name: 'SIGNATURE', value: "AFcWxV21C7fd0v3bYYYRCpSSRl31A3a7vMmHXJAJHHhlsK-5OAyyuu9b"},
    {name: 'RETURNURL', value: "http://www.YourReturnURL.com"},
    {name: 'CANCELURL', value: "http://www.YourCancelURL.com"},
    {name: 'METHOD', value: "SetExpressCheckout"},
    {name: 'PAYMENTREQUEST_0_CURRENCYCODE', value: "EUR"},
    {name: 'PAYMENTREQUEST_0_AMT', value: "0"}
  ];

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
    period: 1360000
  });

  return response;
}

function pUserAccepts() {
  $fh.log('info', 'User decides to pay');
  return {};
}

function pUserDenies() {
  $fh.log('info', 'User denies to pay');
  return {};
}

