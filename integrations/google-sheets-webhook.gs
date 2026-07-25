const SHEET_NAME = 'Enquiries';
const SHARED_TOKEN = 'REPLACE_WITH_A_LONG_RANDOM_TOKEN';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    if (!payload || payload.token !== SHARED_TOKEN) {
      return jsonResponse({ ok: false, error: 'unauthorised' }, 401);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`Missing sheet: ${SHEET_NAME}`);

    sheet.appendRow([
      new Date(),
      clean(payload.name),
      clean(payload.company),
      clean(payload.email),
      clean(payload.service),
      clean(payload.project_market),
      clean(payload.message),
      clean(payload.source_url),
      'New',
      ''
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
}

function clean(value) {
  return String(value || '').replace(/^\s+|\s+$/g, '');
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
