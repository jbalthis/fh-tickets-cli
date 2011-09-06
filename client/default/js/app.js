var responseHandlers = {
  onSetUp: function(response) {
    $fh.webview({'url': response.redirectUrl, 'title': null});
    //window.location = response.redirectUrl;
  },
  onRetrieveDetails: function(response) {
    var retrieveResponse = communicateTillSuccess('pRetrievePayerDetails', {token: setUpResponse.token});
    var finalizeResponse = communicateTillSuccess('pFinalizePayment', {token: setUpResponse.token});
  alert ('done.');
  },
  onFinalize: function(response) {
  }
};

var communicateTillSuccess = function(act, req, nextStep) {
  $fh.act({
    act: act,
    req: req
  }, function(response) {
    if (response.status && response.status === 'ok') {
      nextStep(response);
    } else {
      communicateTillSuccess(act, req);
    }
    return undefined;
  });
};

var checkOutWithPayPal = function () {
  if ($('input[name=VIP]').val() + $('input[name=SectorA]').val() + $('input[name=SectorB]').val() < 1) {
    alert('Pick at least one ticket.');
    return false;
  }

  communicateTillSuccess('pSetPayment', {
    ticketsVIP: $('input[name=VIP]').val(),
    ticketsA:   $('input[name=SectorA]').val(),
    ticketsB:   $('input[name=SectorB]').val()
  }, responseHandlers.onSetUp);

  return false;
};

$fh.ready(function () {
  $('#checkOutWithPayPal').click(checkOutWithPayPal);
});

