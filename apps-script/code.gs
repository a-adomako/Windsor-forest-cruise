var FORMULA_PREFIX = /^[=+\-@]/;

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var now = new Date();
  var dateSubmitted = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd-MMM-yyyy');
  var timeSubmitted = Utilities.formatDate(now, Session.getScriptTimeZone(), 'hh:mm:ss a');

  try {
    var payload = parsePayload_(e);
    var validationError = validatePayload_(payload);

    if (validationError) {
      return jsonResponse_({
        result: 'error',
        message: validationError
      });
    }

    if (payload.company) {
      return jsonResponse_({ result: 'success' });
    }

    var successSheet = ss.getSheetByName('Form Filled');
    successSheet.appendRow([
      dateSubmitted,
      timeSubmitted,
      sanitizeCell_(payload.firstName),
      sanitizeCell_(payload.lastName),
      sanitizeCell_(payload.email).toLowerCase(),
      sanitizeCell_(payload.phone),
      sanitizeCell_(payload.graduatingClass)
    ]);

    return jsonResponse_({ result: 'success' });
  } catch (error) {
    var failureSheet = ss.getSheetByName('Form Failures');
    var rawPayload = (e && e.postData && e.postData.contents) ? e.postData.contents : 'No payload';

    if (failureSheet) {
      failureSheet.appendRow([
        dateSubmitted,
        timeSubmitted,
        rawPayload,
        error.toString()
      ]);
    }

    return jsonResponse_({
      result: 'error',
      message: 'Submission failed.'
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request payload.');
  }

  var data = JSON.parse(e.postData.contents);

  return {
    firstName: valueOrEmpty_(data.firstName),
    lastName: valueOrEmpty_(data.lastName),
    email: valueOrEmpty_(data.email),
    phone: valueOrEmpty_(data.phone),
    graduatingClass: valueOrEmpty_(data.graduatingClass),
    company: valueOrEmpty_(data.company)
  };
}

function validatePayload_(payload) {
  if (!payload.firstName || !payload.lastName) {
    return 'Missing name.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'Invalid email.';
  }

  if (payload.phone.replace(/\D/g, '').length < 10) {
    return 'Invalid phone.';
  }

  if (!payload.graduatingClass) {
    return 'Missing graduating class.';
  }

  return '';
}

function sanitizeCell_(value) {
  var text = valueOrEmpty_(value);
  return FORMULA_PREFIX.test(text) ? "'" + text : text;
}

function valueOrEmpty_(value) {
  return String(value || '').trim();
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
