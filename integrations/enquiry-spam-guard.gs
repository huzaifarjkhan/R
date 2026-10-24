/**
 * Solarist enquiry spam guard — integrate into the CURRENT live Apps Script doPost
 * BEFORE SpreadsheetApp.appendRow() or MailApp.sendEmail().
 *
 * This is a dependency-free, server-side defensive module. Never rely solely
 * on website JavaScript; direct HTTP requests bypass it.
 */
function rejectSpamEnquiry_(fields) {
  var p = fields || {};
  function value(key) { return String(p[key] == null ? '' : p[key]).trim(); }
  var name = value('name'), company = value('company');
  var email = value('email').toLowerCase(), msg = value('message');
  var body = [name, company, msg].join(' ');
  if (value('_honey')) return 'honeypot';
  if (name.length < 2 || name.length > 120) return 'name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return 'email';
  if (company.length > 150 || msg.length < 12 || msg.length > 4000) return 'length';
  if (/https?:\/\/|www\./i.test(name)) return 'name_link';
  if (/goo\.su|(?:перевод|получить|забрать).{0,100}(?:руб|https?:)/iu.test(body)) return 'known_spam';
  // Apply daily caps and per-email limits atomically.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return 'busy';
  try {
    var cache = CacheService.getScriptCache();
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email);
    var id = Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, '').slice(0, 24);
    var key = 'solarist_email_' + id;
    if (cache.get(key)) return 'duplicate_email';
    cache.put(key, '1', 600); // max one enquiry per email per 10 minutes
  } finally { lock.releaseLock(); }
  return ''; // accepted — caller may now append row and email.
}

/**
 * Example for a FORM POST web app:
 *
 * function doPost(e) {
 *   var fields = e && e.parameter || {};
 *   var rejection = rejectSpamEnquiry_(fields);
 *   if (rejection) return renderFormResult_(false, 'Please verify the details and try again.');
 *   // Existing Sheet append and MailApp notifications go here.
 *   return renderFormResult_(true, 'Your enquiry was received.');
 * }
 *
 * Use your EXISTING response renderer to preserve iframe postMessage
 * contract: { source: 'solarist-enquiry-v1', ok: true|false, message: ... }.
 *
 * IMPORTANT: Use CAPTCHA verified server-side plus a new backend endpoint
 * for strong protection. This module is a stopgap, not a complete fix.
 */
