var waitingFor = function(msg) {
  var spinner = $('#spinner');
  if (msg) {
    spinner.find('span').html(msg);
    spinner.show();
  } else {
    spinner.hide();
  }
};

var communicateTillSuccess = function(act, req, nextStep) {
  $fh.act({
    act: act,
    req: req
  }, function(response) {
    if (response.status && response.status === 'ok') {
      nextStep(response);
    } else if (response.delay) {
      setTimeout(function() { communicateTillSuccess(act, req, nextStep); }, response.delay);
    } else {
      communicateTillSuccess(act, req, nextStep);
    }
    return undefined;
  });
};

var responseHandlers = {
  onSetUp: function(response) {
    var webviewParams = {'url': response.redirectUrl, 'title': "Check out"};
    $fh.webview(webviewParams);
    setTimeout(function() {
      communicateTillSuccess('pRetrievePayerDetails', {token: response.token}, responseHandlers.onRetrieveDetails);
    }, 60000);
    waitingFor("Waiting for user's decision&hellip;");
  },
  onRetrieveDetails: function(response) {
    var finalizeResponse = communicateTillSuccess('pFinalizePayment', {token: response.token});
    waitingFor("Finalizing payment&hellip;");
  },
  onFinalize: function(response) {
    alert ('done.');
    waitingFor(false);
  }
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

  waitingFor("Setting up payment&hellip;");
  return false;
};

$fh.ready(function () {
  $('#checkOutWithPayPal').click(checkOutWithPayPal);
});

