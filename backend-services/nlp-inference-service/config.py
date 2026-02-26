import os
from typing import List

# Secure CORS policy by loading allowed origins from an environment variable.
# This prevents unauthorized domains from making requests to the API.
# Example: ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend.com"
ALLOWED_ORIGINS_STR = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS: List[str] = [
    origin.strip() for origin in ALLOWED_ORIGINS_STR.split(",") if origin.strip()
]
