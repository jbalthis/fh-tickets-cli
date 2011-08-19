//For JSLint
/* global $, $fh, window */

var checkOutWithPayPal = function () {
  $fh.act({
    act: 'pSetPayment',
    req: {
      ticketsVIP: $('input[name=VIP]').val(),
      ticketsA:   $('input[name=SectorA]').val(),
      ticketsB:   $('input[name=SectorB]').val()
    }
  }, function(response) {
    if (response.status == 'ok') {
      window.location = response.redirectUrl;
    }
  });
};

$(function () {
  $('#checkOutWithPayPal').click(checkOutWithPayPal);
});

