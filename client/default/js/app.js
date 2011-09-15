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
  req.timestamp = Date.now();
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
    communicateTillSuccess('pRetrievePayerDetails', {token: response.token}, responseHandlers.onRetrieveDetails);
    setStatus('waiting', "Waiting for user's decision&hellip;");
  },
  onRetrieveDetails: function(response) {
    $fh.webview({act:'close'});
    if (response.stop) {
      setStatus('done', 'Transaction cancelled: {reason}.'.replace('{reason}', response.stop));
    } else {
      communicateTillSuccess('pFinalizePayment', {token: response.token}, responseHandlers.onFinalize);
      setStatus('waiting', "Finalizing payment&hellip;");
    }
  },
  onFinalize: function(response) {
    var newStatus = 'Thank you, {customer}, for purchasing {count} tickets.'
          .replace('{customer}', response.customer)
          .replace('{count}', parseInt(response.tickets.A, 10) + parseInt(response.tickets.B, 10) + parseInt(response.tickets.VIP, 10));
    setStatus('done', newStatus);
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

