//For JSLint
/* global $, $fh, window */

var checkOutWithPayPal = function () {
  if ($('input[name=VIP]').val() + $('input[name=SectorA]').val() + $('input[name=SectorB]').val() < 1) {
    alert('Pick at least one ticket.');
    return false;
  }
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
  return false;
};

$(function () {
  $('#checkOutWithPayPal').click(checkOutWithPayPal);
});

