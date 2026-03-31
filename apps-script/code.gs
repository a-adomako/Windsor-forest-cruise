function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the JSON data sent from the form
    var data = JSON.parse(e.postData.contents);
    
    // Append a new row to the active sheet
    sheet.appendRow([
      new Date(),           // Timestamp
      data.firstName,       // First Name
      data.lastName,        // Last Name
      data.email,           // Email
      data.phone,           // Phone Number
      data.graduatingClass  // Graduating Class
    ]);
    
    // Return success response to the client
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error message if something fails
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
