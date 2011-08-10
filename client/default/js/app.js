/*
 * Translates strings like %2d to their ASCII equivalents (dash in this case)
 */
var replaceAsciiHexCodeWithActualCharacter = function(str) {
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
var decodePayPalResponse = function(response) {
  var decoded = {};
  response
    .split('&')
    .map(function(keyval) {
      return keyval.split('=');
    }).forEach(function(pair) {
      decoded[pair[0]] = pair[1].replace(/%[A-Za-z0-9]{2}/g, replaceAsciiHexCodeWithActualCharacter);
    });
  return decoded;
};

var checkOutWithPayPal2 = function() {
  $fh.act({
    act: 'pSetPayment',
    req: {
      ticketsVIP: $('input[name=VIP]').val(),
      ticketsA:   $('input[name=SectorA]').val(),
      ticketsB:   $('input[name=SectorB]').val()
    }
  }, function(response) {
    var decoded = decodePayPalResponse(response.body);
    alert(decoded.TOKEN);
  });
};

var checkOutWithPayPal = function() {
  var currentUrl = window.location.href;

  var requestParams = [
    {name: 'VERSION', value: '63.0'},
    {name: 'USER', value: "skalee_1312461335_biz_api1.gmail.com"},
    {name: 'PWD', value: "1312461375"},
    {name: 'SIGNATURE', value: "AFcWxV21C7fd0v3bYYYRCpSSRl31A3a7vMmHXJAJHHhlsK-5OAyyuu9b"},
    {name: 'RETURNURL', value: currentUrl.replace(/\/index.html/, "/success.html")},
    {name: 'CANCELURL', value: currentUrl.replace(/\/index.html/, "/failure.html")},
    {name: 'METHOD', value: "SetExpressCheckout"},
    {name: 'PAYMENTREQUEST_0_CURRENCYCODE', value: "EUR"},
    {name: 'PAYMENTREQUEST_0_AMT', value: "60"}
  ];


  $fh.web({
    url: "https://api-3t.sandbox.paypal.com/nvp",
    method: 'POST',
    charset: 'UTF-8',
    contentType: 'text/plain',
    params: requestParams,
    headers: [],
    cookies: [],
    period: 1360000
  }, function(response) {
    var decoded = response.body ? decodePayPalResponse(response.body) : {};
    if (!decoded.TOKEN) {
      alert("Something wrong!");
      return;
    }
    var redirectUrl = "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + decoded.TOKEN;
    //$("#payPalFrame iframe").attr('src', redirectUrl);
    //$("#redirector").attr('href', redirectUrl);

    $fh.webview({url: redirectUrl, 'title':"hello"},
      function(result){
        alert(result);
      },
      function(result){
        alert(result);
      });


    //window.location = redirectUrl;
  });

};


/*var checkOutWithPayPal = function() {
  computeFormValues();

  //set up payment via AJAX
  var form = $("#chosenTicketsForm");
  $
    .post(form.attr('action'), form.serialize())
    .success(function(response) {
      var decoded = decodePayPalResponse(response);
      //TODO check if ACK=Success
      var redirectUrl = "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + decoded["TOKEN"];
      $("#payPalFrame iframe").attr('src', redirectUrl);
    });
};*/

var computeFormValues = function() {
  //compute total amount and set it to PAYMENTREQUEST_0_AMT
  var totalAmount = 0;
  for (i = 0; i < 3; i++) {
    totalAmount += $("input[name=L_PAYMENTREQUEST_0_QTY" + i + "]").val() * $("input[name=L_PAYMENTREQUEST_0_AMT" + i + " ]").val();
  }
  $('input[name=PAYMENTREQUEST_0_AMT]').val(totalAmount);

  //disable L_PAYMENTREQUEST_0_AMTm for tickets user doesn't want to buy
  $('.itemAmount').each(function() { $(this).attr('disabled', $(this).siblings('.itemQty').val() == 0); });
};

$(function() {
  $('#checkOutWithPayPal').click(checkOutWithPayPal);
});

