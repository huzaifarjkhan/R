const SOLARIST_CONFIG = Object.freeze({
  SPREADSHEET_ID: '171C7idoa4j-VCMol6JI13D0HYExfY62C1L0uDvtqdSo',
  SHEET_NAME: 'Enquiries',
  OWNER_EMAIL: 'huzaifarjkhan@gmail.com',
  TEST_EMAIL: 'huzaifarjkhan@gmail.com',
  RESPONSE_SOURCE: 'solarist-enquiry-v1',
  RESPONSE_BRIDGE: 'https://solarist.in/enquiry-response.html',
});

function authorizeSolaristEnquiries() {
  const spreadsheet = SpreadsheetApp.openById(SOLARIST_CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SOLARIST_CONFIG.SHEET_NAME);
  if (!sheet) throw new Error(`Sheet tab not found: ${SOLARIST_CONFIG.SHEET_NAME}`);
  Logger.log(`Connected to: ${spreadsheet.getName()} / ${sheet.getName()}`);
  Logger.log(`Remaining recipient quota: ${MailApp.getRemainingDailyQuota()}`);
}

/**
 * Run this function from the Apps Script editor after deployment.
 * It writes a clearly labelled test row and attempts both emails.
 */
function testSolaristEnquiry() {
  const input = {
    name: 'Solarist Integration Test',
    company: 'Solarist',
    email: SOLARIST_CONFIG.TEST_EMAIL,
    service: 'Website form integration test',
    projectMarket: 'Internal company workflow',
    requirements: 'Automated test of Google Sheet logging and both MailApp notifications.',
    sourceUrl: 'apps-script:testSolaristEnquiry',
  };

  validateInput_(input);
  const result = processEnquiry_(input);
  Logger.log(JSON.stringify(result));
  return result;
}

function doGet() {
  return frameResponse_({
    source: SOLARIST_CONFIG.RESPONSE_SOURCE,
    ok: true,
    health: true,
  });
}

function doPost(e) {
  try {
    const input = normaliseInput_(e && e.parameter ? e.parameter : {});
    validateInput_(input);
    return frameResponse_(processEnquiry_(input));
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return frameResponse_({
      source: SOLARIST_CONFIG.RESPONSE_SOURCE,
      ok: false,
      logged: false,
      message: error && error.message
        ? error.message
        : 'We could not process the enquiry right now. Please try again.',
    });
  }
}

function processEnquiry_(input) {
  const submittedDate = new Date();
  const submittedAt = submittedDate.toISOString();
  const submittedDisplay = Utilities.formatDate(
    submittedDate,
    Session.getScriptTimeZone() || 'Asia/Kolkata',
    'dd MMM yyyy, hh:mm a z'
  );
  const rowNumber = appendEnquiryRow_(input, submittedAt);
  const mail = sendEnquiryEmails_(input, submittedAt, submittedDisplay);

  return {
    source: SOLARIST_CONFIG.RESPONSE_SOURCE,
    ok: true,
    logged: true,
    rowNumber,
    ownerEmailSent: mail.ownerEmailSent,
    visitorEmailSent: mail.visitorEmailSent,
  };
}

function appendEnquiryRow_(input, submittedAt) {
  const row = [
    submittedAt,
    safeSheetCell_(input.name),
    safeSheetCell_(input.company),
    safeSheetCell_(input.email),
    safeSheetCell_(input.service),
    safeSheetCell_(input.projectMarket),
    safeSheetCell_(input.requirements),
    safeSheetCell_(input.sourceUrl),
    'New',
    '',
  ];

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.openById(SOLARIST_CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SOLARIST_CONFIG.SHEET_NAME);
    if (!sheet) throw new Error(`Sheet tab not found: ${SOLARIST_CONFIG.SHEET_NAME}`);
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    const rowNumber = sheet.getLastRow();
    console.log(`Solarist enquiry logged in ${SOLARIST_CONFIG.SHEET_NAME}!A${rowNumber}:J${rowNumber}`);
    return rowNumber;
  } finally {
    lock.releaseLock();
  }
}

function normaliseInput_(p) {
  return {
    name: cleanText_(p.name, 120),
    company: cleanText_(p.company, 160),
    email: cleanText_(p.email, 254).toLowerCase(),
    service: cleanText_(p.service, 180),
    projectMarket: cleanText_(p.project_market || p.projectMarket, 120),
    requirements: cleanText_(p.message || p.requirements, 5000),
    sourceUrl: cleanText_(p.source_url || p.sourceUrl, 500),
  };
}

function validateInput_(input) {
  if (input.name.length < 2) throw new Error('Please enter a valid name.');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  if (!emailPattern.test(input.email) || input.email.includes('..')) {
    throw new Error('Please enter a valid email address.');
  }

  if (input.requirements.length < 3) {
    throw new Error('Please add a short description of the requirement.');
  }
}

function sendEnquiryEmails_(input, submittedAt, submittedDisplay) {
  let ownerEmailSent = false;
  let visitorEmailSent = false;

  const details = [
    `Submitted: ${submittedDisplay}`,
    `Submission ID: ${submittedAt}`,
    `Name: ${input.name}`,
    `Company: ${input.company || 'Not provided'}`,
    `Email: ${input.email}`,
    `Service: ${input.service || 'Not specified'}`,
    `Project market: ${input.projectMarket || 'Not specified'}`,
    '',
    'Requirements:',
    input.requirements,
    '',
    `Source: ${input.sourceUrl || 'Not provided'}`,
  ].join('\n');

  try {
    MailApp.sendEmail({
      to: SOLARIST_CONFIG.OWNER_EMAIL,
      replyTo: input.email,
      subject: `New Solarist enquiry — ${input.service || 'Project enquiry'}`,
      body: `A new Solarist website enquiry has been received.\n\n${details}`,
      htmlBody: ownerHtml_(input, submittedDisplay),
      name: 'Solarist Website',
    });
    ownerEmailSent = true;
  } catch (error) {
    console.error(`Owner notification failed: ${error}`);
  }

  try {
    MailApp.sendEmail({
      to: input.email,
      replyTo: SOLARIST_CONFIG.OWNER_EMAIL,
      subject: 'We received your Solarist enquiry',
      body: `Hello ${input.name},\n\nThank you for contacting Solarist. Your enquiry has been received. We will review the details and respond within one to two business days.\n\nService: ${input.service || 'Project enquiry'}\nSubmitted: ${submittedDisplay}\n\nRegards,\nSolarist\nEngineering expertise. Practical automation.`,
      htmlBody: visitorHtml_(input, submittedDisplay),
      name: 'Solarist',
    });
    visitorEmailSent = true;
  } catch (error) {
    console.error(`Visitor confirmation failed: ${error}`);
  }

  return { ownerEmailSent, visitorEmailSent };
}

function ownerHtml_(input, submittedDisplay) {
  return `<div style="font-family:Arial,sans-serif;line-height:1.55;color:#161310;max-width:680px"><h2>New Solarist website enquiry</h2><table style="border-collapse:collapse;width:100%">${emailRow_('Submitted', submittedDisplay)}${emailRow_('Name', input.name)}${emailRow_('Company', input.company || 'Not provided')}${emailRow_('Email', input.email)}${emailRow_('Service', input.service || 'Not specified')}${emailRow_('Project market', input.projectMarket || 'Not specified')}${emailRow_('Source', input.sourceUrl || 'Not provided')}</table><h3>Requirements</h3><div style="white-space:pre-wrap;background:#f5f1e8;padding:16px;border-left:3px solid #d85a1a">${escapeHtml_(input.requirements)}</div></div>`;
}

function visitorHtml_(input, submittedDisplay) {
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#161310;max-width:620px"><p>Hello ${escapeHtml_(input.name)},</p><h2>Your Solarist enquiry has been received.</h2><p>Thank you for reaching out. We will review the details and respond within one to two business days.</p><div style="background:#f5f1e8;padding:16px;margin:22px 0"><strong>Service</strong><br>${escapeHtml_(input.service || 'Project enquiry')}<br><br><strong>Submitted</strong><br>${escapeHtml_(submittedDisplay)}</div><p>Regards,<br><strong>Solarist</strong><br>Engineering expertise. Practical automation.</p></div>`;
}

function emailRow_(label, value) {
  return `<tr><td style="padding:7px 12px 7px 0;color:#655d52;vertical-align:top;width:130px">${escapeHtml_(label)}</td><td style="padding:7px 0;vertical-align:top">${escapeHtml_(value)}</td></tr>`;
}

function cleanText_(value, maxLength) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, maxLength);
}

function safeSheetCell_(value) {
  const text = String(value || '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function frameResponse_(payload) {
  const encodedPayload = encodeURIComponent(JSON.stringify(payload));
  const bridgeUrl = `${SOLARIST_CONFIG.RESPONSE_BRIDGE}#${encodedPayload}`;
  const html = `<!doctype html><meta charset="utf-8"><script>window.location.replace(${JSON.stringify(bridgeUrl)});<\/script>`;
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}