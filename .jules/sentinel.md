## 2026-02-01 - [NLP Service Hardening]
**Vulnerability:** Overly permissive CORS (allow_headers=["*"], cors_allowed_origins="*") and missing input validation (DoS risk) in the NLP Inference Service. Also a NameError in the Socket.IO handler that could cause crashes.
**Learning:** Security configurations in FastAPI and Socket.IO were inconsistent and defaulted to overly permissive values. The absence of input length limits at the Pydantic level and in the socket handler exposed the service to resource exhaustion attacks.
**Prevention:** Always enforce strict CORS policies from the start using environment variables. Use Pydantic's Field constraints for all external-facing models to limit input size and valid ranges. Ensure variables are defined before logging to avoid DoS via NameError.
