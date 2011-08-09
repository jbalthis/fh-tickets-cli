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

var checkOutWithPayPal = function() {
  $fh.act({
    act: 'ppSetPayment',
    req: {
      /*"ticketsVIP": $('input[name=VIP]').val(),
      "ticketsA":   $('input[name=SectorA]').val(),
      "ticketsB":   $('input[name=SectorB]').val()*/
    }
  }, function(response) {
    alert(response);
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

