## 2026-01-27 - Hardcoded Zoho Webhook Secret
**Vulnerability:** A hardcoded Zoho Flow webhook URL containing a `zapikey` was found in `src/app/api/zoho-webhook/route.js`.
**Learning:** Hardcoded secrets often slip in during rapid prototyping or when integrating third-party webhooks without setting up environment variables immediately.
**Prevention:** Always use environment variables for third-party service URLs and keys. Implement a pre-commit check or linting rule to detect potential secrets (high entropy strings) in code.
