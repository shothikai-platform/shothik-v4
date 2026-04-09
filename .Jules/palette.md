## 2025-02-26 - Loading States in Research Tools
**Learning:** Users perceive "stuck" UI when long-running processes (like research generation) don't have immediate visual feedback. A simple spinner inside the action button provides necessary reassurance.
**Action:** Always couple async trigger buttons with an inline loading state (spinner) and update aria-labels to reflect the "processing" state.
