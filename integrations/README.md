# Solarist enquiry logging

The website currently keeps the proven FormSubmit email delivery active. A native Google Sheet named **Solarist Website Enquiries** has also been prepared.

## One-time activation

1. Open the Google Sheet.
2. Choose **Extensions → Apps Script**.
3. Replace `Code.gs` with `google-sheets-webhook.gs` from this directory.
4. Replace `REPLACE_WITH_A_LONG_RANDOM_TOKEN` with a private random token.
5. Deploy as a Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the `/exec` URL.
7. Add the URL and matching token to the website submission script.
8. Submit one test enquiry and confirm both the email and spreadsheet row arrive.

Do not commit the real token to the public repository. The webhook should be configured only after the Apps Script endpoint is authorised.