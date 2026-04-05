function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the JSON data sent from the form
    var data = JSON.parse(e.postData.contents);

    // Split timestamp into separate date and time strings
    var now = new Date();
    var dateSubmitted = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd-MMM-yyyy');
    var timeSubmitted = Utilities.formatDate(now, Session.getScriptTimeZone(), 'hh:mm:ss a');

    // Columns: Date Submitted | Time Submitted | First Name | Last Name | Email | Phone Number | Graduating Class
    sheet.appendRow([
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
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
