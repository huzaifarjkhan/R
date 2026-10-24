# Solarist enquiry form — urgent production security rollout

**Status:** Protected Apps Script code is committed, but GitHub cannot deploy code into the Google Apps Script web app. Direct spam POSTs will continue until the existing Apps Script deployment is updated. The public GitHub Pages site is left functioning.

## 1. Emergency protection (do this first)

1. Open your **Solarist Website Enquiries** spreadsheet > Extensions > Apps Script.
2. Replace the entire current **Code.gs** with [solarist-production-secure.gs](./solarist-production-secure.gs). Do **not** paste just the old independent `enquiry-spam-guard.gs`; use the complete production handler.
3. Save. In the function dropdown select `testSolaristSpamValidation`, press Run. Expected result: *6 cases passed, zero emails/rows*. Next run `authorizeSolaristEnquiries` to verify sheet access and notification identity. If owner email cannot be resolved, set Script Property `SOLARIST_OWNER_EMAIL` to your own address (never put it in public GitHub).
4. Deploy > Manage deployments > choose the **currently active Web app** > Edit > Version: **New version** > Deploy. Use the original "Execute as: Me / Who has access: Anyone" settings. This updates the same web-app URL without needing to change the HTML.
5. Submit **one legitimate enquiry** from https://solarist.in/#contact using at least 12 characters in Requirements. Check success popup, row appended, and both emails. Allow 10 minutes between test submissions from the same email address.
6. Re-run a validation-only test if needed. `testSolaristEnquiry` is different: it intentionally writes a labelled row and sends test emails and should only be run manually in the editor.

The immediate protections reject the current spam signature, blank/spoof-typical source URLs, honeypot values, invalid options, too-short messages, direct spam links in names, duplicate emails within 10 minutes, and a maximum of 100 accepted website enquiries daily. These are **risk-reduction checks**, not full bot authentication. The `source_url` field can be forged.

## 2. Strong protection: Cloudflare Turnstile (required next)

The Solarist website `index.html` already contains a **dormant Turnstile widget integration**, a hidden token field generated when activated, and form-submit checks and token-reset handling. It has no visible effect until the public site key is inserted. The server-side handler already supports Siteverify, but it is not enforced until you add the secret to Script Properties.

1. In [Cloudflare Turnstile](https://dash.cloudflare.com/), create a site widget. Name it **Solarist Enquiry Form**. Allow both `solarist.in` and `www.solarist.in`. Choose **Managed** mode.
2. Copy the **PUBLIC site key** (safe to share for inclusion in GitHub). Keep the **PRIVATE secret key** in your own Cloudflare account.
3. Replace the exact `data-sitekey=""` attribute of `#solaristTurnstileWidget` in `index.html` with `data-sitekey="YOUR_PUBLIC_SITE_KEY"` and push to `main`. GitHub Pages will serve the enabled widget. No other HTML snippet is needed.
4. Confirm the widget renders on https://solarist.in/#contact.
5. Only **after** confirming the widget is visible, go to Google Apps Script > Project Settings > Script Properties and set `TURNSTILE_SECRET` equal to your **PRIVATE secret key**, then save. This immediately enables mandatory Siteverify validation because the live Apps Script checks the property dynamically on every request. Do NOT put the secret in GitHub or chat.
6. Submit one genuine test message with a unique email address and a project description at least 12 characters long. Verify the confirmation popup, owner email, visitor email, and Sheet row. Test a direct POST lacking Turnstile token: it must create no row or email. The browser code automatically resets used tokens after confirmed success or failure.
7. If desired, rotate the exposed Apps Script Web app URL and retire the former deployment only once the new one is verified. Be aware the endpoint remains public but requests without valid siteverified tokens must be rejected.

Turnstile works on GitHub Pages without migrating your GoDaddy DNS or site hosting. It requires the public widget on the site **and** server-side Siteverify. A Turnstile widget alone is not a security boundary.

## 3. Optional extra protection

If attacks still burden Apps Script executions after Turnstile deployment, move the public POST entry point to a Cloudflare Worker with an enforced edge rate limit, and keep the Apps Script endpoint behind a private credential forwarded only by the Worker. Revoke the older directly accessible deployment.

## Safety and verification

- Do not delete or alter existing enquiries without preserving historical records.
- Keep the existing HTML iframe + `enquiry-response.html` postMessage success contract.
- The test-only function bypasses the public doPost route, so it MUST NOT be exposed as an HTTP endpoint.
- No installed tool here can directly edit/deploy the user's live Apps Script project or create the Cloudflare widget/secret in their Cloudflare account. Until both actions are completed, the live spam issue is not fully resolved.
