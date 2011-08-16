//For JSLint
/* global $, $fh, window */

var checkOutWithPayPal = function () {
  $fh.act({
    act: 'pSetPayment',
    req: {}
  }, function(response) {
    //$("#payPalFrame iframe").attr('src', redirectUrl);
    if (response.status == 'ok') {
      window.location = response.redirectUrl;
    }
  });
};

var checkOutWithPayPal2 = function () {
  $fh.act({
    act: 'pSetPayment',
    req: {
      ticketsVIP: $('input[name=VIP]').val(),
      ticketsA:   $('input[name=SectorA]').val(),
      ticketsB:   $('input[name=SectorB]').val()
    }
  }, function (response) {
    var decoded = decodePayPalResponse(response.body);
    alert(decoded.TOKEN);
  });
};

var checkOutWithPayPal7 = function () {
  $fh.act({
    act: 'pFetchConfig',
    req: {}
  }, function (response1) {
    var requestParams = response1.config;

    $fh.web({
      url: "https://api-3t.sandbox.paypal.com/nvp",
      method: 'POST',
      charset: 'UTF-8',
      contentType: 'text/plain',
      params: requestParams,
      headers: [],
      cookies: [],
      period: 1360000
    }, function (response) {
      var decoded = response.body ? decodePayPalResponse(response.body) : {};
      if (!decoded.TOKEN) {
        alert("Something wrong!");
        return;
      }
      var redirectUrl = "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + decoded.TOKEN;
      $("#payPalFrame iframe").attr('src', redirectUrl);
      window.location = redirectUrl;
      return true;

    /*var redirectUrl = "http://onet.pl/";
    $fh.webview({'url': redirectUrl, 'title': "hello"},
      function (result) {
        alert(result);
      },
      function (result) {
        alert(result);
      });*/

    });
  });
};

var checkOutWithPayPal7 = function () {

  var
    requestParams = [
      {name: 'VERSION', value: '63.0'},
      {name: 'USER', value: "skalee_1312461335_biz_api1.gmail.com"},
      {name: 'PWD', value: "1312461375"},
      {name: 'SIGNATURE', value: "AFcWxV21C7fd0v3bYYYRCpSSRl31A3a7vMmHXJAJHHhlsK-5OAyyuu9b"},
      {name: 'RETURNURL', value: returnUrl},
      {name: 'CANCELURL', value: cancelUrl},
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
  }, function (response) {
    var decoded = response.body ? decodePayPalResponse(response.body) : {};
    if (!decoded.TOKEN) {
      alert("Something wrong!");
      return;
    }
    var redirectUrl = "https://www.sandbox.paypal.com/uk/cgi-bin/webscr?cmd=_express-checkout-mobile&useraction=commit&token=" + decoded.TOKEN;
    $("#payPalFrame iframe").attr('src', redirectUrl);
    //$("#redirector").attr('href', redirectUrl);
    window.location = redirectUrl;
    return true;

    var redirectUrl = "http://onet.pl/";
    $fh.webview({'url': redirectUrl, 'title': "hello"},
      function (result) {
        alert(result);
      },
      function (result) {
        alert(result);
      });

    return true;

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

var computeFormValues = function () {
  //compute total amount and set it to PAYMENTREQUEST_0_AMT
  var totalAmount = 0;
  for (var i = 0; i < 3; i++) {
    totalAmount += $("input[name=L_PAYMENTREQUEST_0_QTY" + i + "]").val() * $("input[name=L_PAYMENTREQUEST_0_AMT" + i + " ]").val();
  }
  $('input[name=PAYMENTREQUEST_0_AMT]').val(totalAmount);

  //disable L_PAYMENTREQUEST_0_AMTm for tickets user doesn't want to buy
  $('.itemAmount').each(function () {
    $(this).attr('disabled', $(this).siblings('.itemQty').val() == 0);
  });
};

$(function () {
  $('#checkOutWithPayPal').click(checkOutWithPayPal);
});

