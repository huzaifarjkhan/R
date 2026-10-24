# Solarist enquiry form — urgent production security rollout

**Status:** Protected Apps Script code is committed, but GitHub cannot deploy code into the Google Apps Script web app. Direct spam POSTs will continue until the existing Apps Script deployment is updated. The public GitHub Pages site is left functioning.

## 1. Emergency protection (do this first)

1. Open [Solarist Website Enquiries](https://docs.google.com/spreadsheets/d/171C7idoa4j-VCMol6JI13D0HYExfY62C1L0uDvtqdSo/edit) > Extensions > Apps Script.
2. Replace the entire current **Code.gs** with [solarist-production-secure.gs](./solarist-production-secure.gs). Do **not** paste just the old independent `enquiry-spam-guard.gs`; use the complete production handler.
3. Save. In function dropdown select `testSolaristSpamValidation`, press Run. Expected result: *6 cases passed, zero emails/rows*.
4. Deploy > Manage deployments > choose the **currently active Web app** > Edit > Version: **New version** > Deploy. Use the original "Execute as: Me / Who has access: Anyone" settings. This updates the same web-app URL without needing to change the HTML.
5. Submit **one legitimate enquiry** from https://solarist.in/#contact using at least 12 characters in Requirements. Check success popup, row appended, and both emails. Allow 10 minutes between test submissions from the same email address.
6. Re-run a validation-only test if needed. `testSolaristEnquiry` is different: it intentionally writes a labelled row and sends test emails and should only be run manually in the editor.

The immediate protections reject the current spam signature, blank/spoof-typical source URLs, honeypot values, invalid options, too-short messages, direct spam links in names, duplicate emails within 10 minutes, and a maximum of 100 accepted website enquiries daily. These are **risk-reduction checks**, not full bot authentication. The `source_url` field can be forged.

## 2. Strong protection: Cloudflare Turnstile (required next)

1. In [Cloudflare Turnstile](https://dash.cloudflare.com/), create a site widget for `solarist.in` and `www.solarist.in`. Copy the **public site key** and **private secret key** separately. Don't place the secret in GitHub or chat.
2. Add the **public site key** to the contact form's existing `index.html` *inside* the `<form id="solaristEnquiryForm">` element, before the submit button:

```html
<div class="field full">
  <div class="cf-turnstile" data-sitekey="REPLACE_WITH_PUBLIC_SITE_KEY"
       data-action="solarist_enquiry" data-theme="light"></div>
</div>
```

3. Also include this external script in HTML before the closing `</body>` tag:

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

4. In Apps Script Project Settings > Script Properties, add `TURNSTILE_SECRET` with the **private secret**. No script-code changes needed; `verifyTurnstile_` already validates on each request through Cloudflare Siteverify and checks the hostname and `solarist_enquiry` action.
5. Publish HTML **before** enabling the Apps Script secret, ideally in one controlled maintenance window. If you set the secret first, every submission lacking a Turnstile token will fail.
6. Test a legitimate visitor: one Sheet row, one owner notification, one visitor confirmation, successful popup. Test direct HTTP POST lacking token: it must create no row and no email. A duplicated Turnstile token must also fail. Reset Turnstile with `window.turnstile?.reset()` after submitting and whenever a user retries because tokens expire and are single-use.
7. Rotate to a new Web app deployment URL and retire/archive the old one if you want to reduce continued automated traffic to the exposed endpoint. Do not archive the old deployment until the new site URL is published and tested.

Turnstile is a real two-part check: the widget creates a browser token; Apps Script verifies it with Cloudflare using a secret that never enters public source code. Frontend-only Turnstile or a browser-only honeypot is insufficient.

## 3. Optional extra protection

If attacks still burden Apps Script executions after Turnstile deployment, move the public POST entry point to a Cloudflare Worker with an enforced edge rate limit, and keep the Apps Script endpoint behind a private credential forwarded only by the Worker. Revoke the older directly accessible deployment.

## Safety and verification

- Do not delete or alter existing enquiries without preserving historical records.
- Keep the existing HTML iframe + `enquiry-response.html` postMessage success contract.
- The test-only function bypasses the public doPost route, so it MUST NOT be exposed as an HTTP endpoint.
- No installed tool here can directly edit/deploy the user's live Apps Script project or create the Cloudflare widget/secret in their Cloudflare account. Until both actions are completed, the live spam issue is not fully resolved.
