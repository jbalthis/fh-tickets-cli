var communicateTillSuccess = function(act, req) {
  $fh.act({
    act: 'pSetPayment',
    req: req
  }, function(response) {
    if (response.status && response.status === 'ok') {
      return response;
    } else {
      return communicateTillSuccess(act, req);
    }
  });
};

var checkOutWithPayPal = function () {
  if ($('input[name=VIP]').val() + $('input[name=SectorA]').val() + $('input[name=SectorB]').val() < 1) {
    alert('Pick at least one ticket.');
    return false;
  }

  var setUpResponse = communicateTillSuccess('pSetPayment', {
    ticketsVIP: $('input[name=VIP]').val(),
    ticketsA:   $('input[name=SectorA]').val(),
    ticketsB:   $('input[name=SectorB]').val()
  });

  //$fh.webview({'url': response.redirectUrl, 'title': null});
  window.location = setUpResponse.redirectUrl;

  var retrieveResponse = communicateTillSuccess('pRetrievePayerDetails', {token: setUpResponse.token});
  var finalizeResponse = communicateTillSuccess('pFinalizePayment', {token: setUpResponse.token});
  alert ('done.');
  return false;
};

$(function () {
  $('#checkOutWithPayPal').click(checkOutWithPayPal);
});

