function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Split timestamp into separate date and time strings
  var now = new Date();
  var dateSubmitted = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd-MMM-yyyy');
  var timeSubmitted = Utilities.formatDate(now, Session.getScriptTimeZone(), 'hh:mm:ss a');

  try {
    var data = JSON.parse(e.postData.contents);

    // Write to "Form Filled" sheet
    // Columns: Date Submitted | Time Submitted | First Name | Last Name | Email | Phone Number | Graduating Class
    var successSheet = ss.getSheetByName('Form Filled');
    successSheet.appendRow([
      dateSubmitted,
      timeSubmitted,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.graduatingClass
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Write to "Form Failures" sheet
    // Columns: Date Submitted | Time Submitted | Raw Payload | Error Message
    var failureSheet = ss.getSheetByName('Form Failures');
    var rawPayload = (e && e.postData) ? e.postData.contents : 'No payload';
    failureSheet.appendRow([
      dateSubmitted,
      timeSubmitted,
      rawPayload,
      error.toString()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
