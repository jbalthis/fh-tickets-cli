var setStatus = function(kind, msg) {
  var statusP = $('#status');
  if (msg) {
    statusP.find('img').toggle(kind == 'waiting');
    statusP.find('span').html(msg);
    statusP.show();
  } else {
    statusP.hide();
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
    setStatus('waiting', "Waiting for user's decision&hellip;");
  },
  onRetrieveDetails: function(response) {
    if (response.stop) {
      waitingFor(null);
    } else {
      communicateTillSuccess('pFinalizePayment', {token: response.token}, responseHandlers.onFinalize);
      setStatus('waiting', "Finalizing payment&hellip;");
    }
  },
  onFinalize: function(response) {
    setStatus('done', 'Thank you, {customer}, for purchasing tickets.');
  }
};

var checkOutWithPayPal = function () {
  if ($('input[name=VIP]').val() + $('input[name=SectorA]').val() + $('input[name=SectorB]').val() < 1) {
    alert('Pick at least one ticket.');
    return false;
  }

  communicateTillSuccess('pSetPayment', {
    tickets: {
      VIP: $('input[name=VIP]').val(),
      A:   $('input[name=SectorA]').val(),
      B:   $('input[name=SectorB]').val()
    }
  }, responseHandlers.onSetUp);

  setStatus('waiting', "Setting up payment&hellip;");
  return false;
};

$fh.ready(function () {
  $('#checkOutWithPayPal').click(checkOutWithPayPal);
});

