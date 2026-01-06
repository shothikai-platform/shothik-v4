## 2024-05-23 - Hardcoded Credentials in API Route
**Vulnerability:** A hardcoded Zoho webhook URL containing an API key (`zapikey`) was found in `src/app/api/zoho-webhook/route.js`.
**Learning:** Developers might hardcode full URLs including query parameters for quick integration, bypassing environment variable checks. This is common when "just getting it to work" or when the URL is copy-pasted from a third-party dashboard.
**Prevention:** Always inspect URLs for potential secrets, especially when they include query parameters like `key`, `token`, or `secret`. Use environment variables for all external service endpoints.
