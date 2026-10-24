/**
 * Solarist production enquiry handler (GitHub Pages -> Apps Script -> Sheet + MailApp)
 * SECURITY:
 *  - filters spam BEFORE appendRow / sendEmail
 *  - enforces field allowlists, source check, honeypot, replay and submission quotas
 *  - validates Cloudflare Turnstile at the server when TURNSTILE_SECRET is configured
 *
 * Install: paste this ENTIRE FILE into the existing Apps Script Code.gs.
 * Set TURNSTILE_SECRET in Project Settings > Script Properties when the
 * website has a configured Turnstile widget (do NOT put that secret on GitHub).
 * Then Deploy > Manage deployments > Edit > New version > Deploy.
 */
const SOLARIST_CONFIG = Object.freeze({
  SPREADSHEET_ID: '171C7idoa4j-VCMol6JI13D0HYExfY62C1L0uDvtqdSo',
  SHEET_NAME: 'Enquiries',
  OWNER_EMAIL: 'huzaifarjkhan@gmail.com',
  TEST_EMAIL: 'huzaifarjkhan@gmail.com',
  RESPONSE_SOURCE: 'solarist-enquiry-v1',
  RESPONSE_BRIDGE: 'https://solarist.in/enquiry-response.html',
  MAX_DAILY_SUBMISSIONS: 100, // emergency damage cap, tune after traffic analysis
  MIN_MESSAGE_LENGTH: 12,
});

const SOLARIST_SERVICES = Object.freeze([
  'Solar PV engineering', 'Solar thermal design', 'BESS engineering',
  'Revit family / BIM content', 'Engineering tools / technical documentation',
  'AI workflow deployment', 'Solar project estimation', 'Other technical enquiry'
]);
const SOLARIST_MARKETS = Object.freeze([
  'Residential', 'Commercial', 'Manufacturer / product',
  'Internal company workflow', 'Not sure yet'
]);

function authorizeSolaristEnquiries() {
  const spreadsheet = SpreadsheetApp.openById(SOLARIST_CONFIG.SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SOLARIST_CONFIG.SHEET_NAME);
  if (!sheet) throw new Error('Sheet tab not found');
  Logger.log('Connected to: ' + spreadsheet.getName() + ' / ' + sheet.getName());
  Logger.log('Remaining recipient quota: ' + MailApp.getRemainingDailyQuota());
  Logger.log('Turnstile configured: ' +
    !!PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET'));
}

/** Editor-only integration check. Not accessible from the public doPost endpoint. */
function testSolaristEnquiry() {
  const input = {
    name: 'Solarist Integration Test',
    company: 'Solarist',
    email: SOLARIST_CONFIG.TEST_EMAIL,
    service: 'Website form integration test',
    projectMarket: 'Internal company workflow',
    requirements: 'Automated test of Google Sheet logging and both MailApp notifications.',
    sourceUrl: 'apps-script:testSolaristEnquiry'
  };
  const result = processEnquiry_(input);
  Logger.log(JSON.stringify(result));
  return result;
}

function doGet() {
  return frameResponse_({source: SOLARIST_CONFIG.RESPONSE_SOURCE, ok: true, health: true});
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const input = normaliseInput_(p);

    // These controls run BEFORE every paid/quota-limited action.
    validateInput_(input, p);
    verifyTurnstile_(p['cf-turnstile-response']);
    reserveSubmission_(input);

    return frameResponse_(processEnquiry_(input));
  } catch (error) {
    // Don't expose implementation details or anti-abuse rules in the response.
    console.warn('Solarist enquiry rejected or failed: ' + String(error));
    return frameResponse_({
      source: SOLARIST_CONFIG.RESPONSE_SOURCE,
      ok: false,
      logged: false,
      message: 'We could not accept your enquiry. Please check the details and verification, then try again later.'
    });
  }
}

/** Keep browser form and server in sync. Never trust browser-only validation. */
function validateInput_(input, p) {
  if (String(p._honey || '').trim()) throw new Error('honeypot');
  if (input.name.length < 2 || input.name.length > 120) throw new Error('name');
  if (input.company.length > 160) throw new Error('company');
  if (input.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(input.email) ||
      input.email.includes('..')) throw new Error('email');
  if (input.requirements.length < SOLARIST_CONFIG.MIN_MESSAGE_LENGTH ||
      input.requirements.length > 5000) throw new Error('message');

  // Reject oversized raw values, not just their normalized truncations.
  const limits = {name: 120, company: 160, email: 254, message: 5000, source_url: 500};
  Object.keys(limits).forEach(key => {
    if (String(p[key] || '').length > limits[key]) throw new Error('oversized_' + key);
  });

  if (SOLARIST_SERVICES.indexOf(input.service) < 0) throw new Error('service');
  if (SOLARIST_MARKETS.indexOf(input.projectMarket) < 0) throw new Error('market');

  // The live browser always supplies source_url. This is a spam heuristic,
  // NOT authentication: an attacker can forge this field.
  if (!/^https:\/\/(?:www\.)?solarist\.in(?:[/?#]|$)/i.test(input.sourceUrl)) {
    throw new Error('source');
  }

  const combined = [input.name, input.company, input.requirements].join(' ');
  if (/https?:\/\/|www\./i.test(input.name)) throw new Error('link_in_name');
  if (/goo\.su|(?:перевод|получить|забрать).{0,120}(?:руб|https?:)/iu.test(combined)) {
    throw new Error('known_spam');
  }
  if (/[\r\n]/.test(input.service)) throw new Error('header_injection');
}

/**
 * Cloudflare Siteverify: secret stored only in Apps Script Script Properties.
 * Do not send a secret from index.html or embed it in a public repository.
 * While secret is unconfigured, emergency heuristics apply but Turnstile
 * is NOT protecting the endpoint yet.
 */
function verifyTurnstile_(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) return; // Emergency compatibility until widget and key are ready.
  if (!token || String(token).length > 2048) throw new Error('turnstile_missing');
  const response = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: {secret: secret, response: String(token)},
    muteHttpExceptions: true,
    followRedirects: false
  });
  if (response.getResponseCode() !== 200) throw new Error('turnstile_http');
  const data = JSON.parse(response.getContentText());
  const host = String(data.hostname || '').toLowerCase();
  if (!data.success || (host !== 'solarist.in' && host !== 'www.solarist.in')) {
    throw new Error('turnstile_invalid');
  }
  if (data.action && data.action !== 'solarist_enquiry') {
    throw new Error('turnstile_action');
  }
}

/**
 * Lock + persistent counters prevent concurrent submissions from bypassing
 * daily cap. Cache prevents repeats from the same email and same content.
 * CacheService is a best-effort backstop, not an IP-based rate limit.
 */
function reserveSubmission_(input) {
  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    const props = PropertiesService.getScriptProperties();
    const cache = CacheService.getScriptCache();
    const dateKey = Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyyMMdd');
    const counterKey = 'solarist_daily_' + dateKey;
    const daily = Number(props.getProperty(counterKey) || 0);
    if (daily >= SOLARIST_CONFIG.MAX_DAILY_SUBMISSIONS) throw new Error('daily_cap');

    const emailKey = 'solarist_email_' + digestKey_(input.email);
    const messageKey = 'solarist_message_' +
      digestKey_(input.email + '|' + input.requirements.toLowerCase());
    if (cache.get(emailKey) || cache.get(messageKey)) throw new Error('duplicate');

    // Persist reservation before storage and email to prevent concurrent floods.
    props.setProperty(counterKey, String(daily + 1));
    cache.put(emailKey, '1', 1800); // One enquiry/email every 30 minutes.
    cache.put(messageKey, '1', 21600); // Identical repeat blocked for 6 hours.
    // Clean up yesterday's counter; key for previous UTC day only.
    const yesterday = Utilities.formatDate(
      new Date(Date.now() - 86400000), 'Etc/UTC', 'yyyyMMdd');
    props.deleteProperty('solarist_daily_' + yesterday);
  } finally {
    lock.releaseLock();
  }
}

function digestKey_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, String(value));
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, '').slice(0, 28);
}

function processEnquiry_(input) {
  const submittedDate = new Date();
  const submittedAt = submittedDate.toISOString();
  const submittedDisplay = Utilities.formatDate(
    submittedDate, Session.getScriptTimeZone() || 'Asia/Kolkata',
    'dd MMM yyyy, hh:mm a z');
  const rowNumber = appendEnquiryRow_(input, submittedAt);
  const mail = sendEnquiryEmails_(input, submittedAt, submittedDisplay);
  return {
    source: SOLARIST_CONFIG.RESPONSE_SOURCE,
    ok: true, logged: true, rowNumber: rowNumber,
    ownerEmailSent: mail.ownerEmailSent,
    visitorEmailSent: mail.visitorEmailSent
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
    'New', ''
  ];
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.openById(SOLARIST_CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SOLARIST_CONFIG.SHEET_NAME);
    if (!sheet) throw new Error('Sheet tab not found');
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    const rowNumber = sheet.getLastRow();
    console.log('Solarist enquiry logged at row ' + rowNumber);
    return rowNumber;
  } finally {
    lock.releaseLock();
  }
}

function normaliseInput_(p) {
  return {
    name: cleanText_(p.name, 121),
    company: cleanText_(p.company, 161),
    email: cleanText_(p.email, 255).toLowerCase(),
    service: cleanText_(p.service, 181),
    projectMarket: cleanText_(p.project_market || p.projectMarket, 121),
    requirements: cleanText_(p.message || p.requirements, 5001),
    sourceUrl: cleanText_(p.source_url || p.sourceUrl, 501)
  };
}

function sendEnquiryEmails_(input, submittedAt, submittedDisplay) {
  let ownerEmailSent = false;
  let visitorEmailSent = false;
  const details = [
    'Submitted: ' + submittedDisplay,
    'Submission ID: ' + submittedAt,
    'Name: ' + input.name,
    'Company: ' + (input.company || 'Not provided'),
    'Email: ' + input.email,
    'Service: ' + (input.service || 'Not specified'),
    'Project market: ' + (input.projectMarket || 'Not specified'),
    '', 'Requirements:', input.requirements, '',
    'Source: ' + (input.sourceUrl || 'Not provided')
  ].join('\n');
  try {
    MailApp.sendEmail({
      to: SOLARIST_CONFIG.OWNER_EMAIL, replyTo: input.email,
      subject: 'New Solarist enquiry — ' + input.service,
      body: 'A new Solarist website enquiry has been received.\n\n' + details,
      htmlBody: ownerHtml_(input, submittedDisplay),
      name: 'Solarist Website'
    });
    ownerEmailSent = true;
  } catch (error) { console.error('Owner email failed: ' + error); }
  try {
    MailApp.sendEmail({
      to: input.email, replyTo: SOLARIST_CONFIG.OWNER_EMAIL,
      subject: 'We received your Solarist enquiry',
      body: 'Hello ' + input.name + ',\n\nThank you for contacting Solarist. Your enquiry has been received. We will review the details and respond within one to two business days.\n\nService: ' + input.service + '\nSubmitted: ' + submittedDisplay + '\n\nRegards,\nSolarist\nEngineering expertise. Practical automation.',
      htmlBody: visitorHtml_(input, submittedDisplay),
      name: 'Solarist'
    });
    visitorEmailSent = true;
  } catch (error) { console.error('Visitor email failed: ' + error); }
  return {ownerEmailSent: ownerEmailSent, visitorEmailSent: visitorEmailSent};
}

function ownerHtml_(input, submittedDisplay) {
  return '<div style="font-family:Arial,sans-serif;line-height:1.55;color:#161310;max-width:680px"><h2>New Solarist website enquiry</h2><table style="border-collapse:collapse;width:100%">' +
    emailRow_('Submitted', submittedDisplay) +
    emailRow_('Name', input.name) +
    emailRow_('Company', input.company || 'Not provided') +
    emailRow_('Email', input.email) +
    emailRow_('Service', input.service) +
    emailRow_('Project market', input.projectMarket) +
    emailRow_('Source', input.sourceUrl) +
    '</table><h3>Requirements</h3><div style="white-space:pre-wrap;background:#f5f1e8;padding:16px;border-left:3px solid #d85a1a">' +
    escapeHtml_(input.requirements) + '</div></div>';
}

function visitorHtml_(input, submittedDisplay) {
  return '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#161310;max-width:620px"><p>Hello ' +
    escapeHtml_(input.name) +
    ',</p><h2>Your Solarist enquiry has been received.</h2><p>Thank you for reaching out. We will review the details and respond within one to two business days.</p><div style="background:#f5f1e8;padding:16px;margin:22px 0"><strong>Service</strong><br>' +
    escapeHtml_(input.service) + '<br><br><strong>Submitted</strong><br>' +
    escapeHtml_(submittedDisplay) +
    '</div><p>Regards,<br><strong>Solarist</strong><br>Engineering expertise. Practical automation.</p></div>';
}

function emailRow_(label, value) {
  return '<tr><td style="padding:7px 12px 7px 0;color:#655d52;vertical-align:top;width:130px">' +
    escapeHtml_(label) + '</td><td style="padding:7px 0;vertical-align:top">' +
    escapeHtml_(value) + '</td></tr>';
}

function cleanText_(value, maxLength) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, maxLength);
}
function safeSheetCell_(value) {
  const s = String(value || '');
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function escapeHtml_(value) {
  return String(value || '').replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function frameResponse_(payload) {
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const bridge = SOLARIST_CONFIG.RESPONSE_BRIDGE + '#' + encoded;
  const html = '<!doctype html><meta charset="utf-8"><script>window.location.replace(' +
    JSON.stringify(bridge) + ');<\/script>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
