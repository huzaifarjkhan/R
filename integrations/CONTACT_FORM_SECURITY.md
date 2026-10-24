# Urgent: contact form spam protection

The production form posts directly to a public Google Apps Script web-app URL. A browser honeypot alone does not protect the backend. Bots may bypass the website and POST directly.

## Required production remediation

1. In the spreadsheet, Extensions > Apps Script, open the **currently deployed** web-app code (not just the example in this repository).
2. Before any calls to SpreadsheetApp.appendRow or MailApp.sendEmail, reject nonempty _honey, missing/invalid email, blank name, short or excessively long message, shortened-link scam patterns, and repeated submissions. Apply these checks server-side regardless of HTTP origin.
3. Set limits in persistent script storage / CacheService with LockService for concurrency; do not trust user-supplied source_url, client timestamps, tokens, or user agent. Never place a reusable authentication secret in publicly served HTML.
4. For robust protection, route website POST requests through a trusted backend (such as a Cloudflare Worker) that validates Cloudflare Turnstile server-side, imposes rate limits, and forwards to a *new* secret backend endpoint. The current Apps Script URL must be retired/redeployed as a new deployment, otherwise attackers can bypass Turnstile.
5. Keep sending email / logging only after successful validation; continue returning the existing postMessage success/error contract to the website confirmation popup.
6. Test one legitimate message from the website plus honeypot, missing CAPTCHA, repeated request and scam-text test cases; ensure rejected messages generate neither spreadsheet rows nor emails.
7. After the production endpoint is rotated and the website points to the new protected endpoint, revoke the old deployment.

As of 2026-10-24, code changes in GitHub alone **cannot block direct POSTs to the existing Apps Script deployment**.
