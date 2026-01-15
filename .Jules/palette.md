## 2024-05-22 - Tooltips for Icon-Only Buttons
**Learning:** Icon-only buttons (like copy/download) are ambiguous without text labels. While standard icons (copy, download) are recognizable, tooltips provide confirmation and accessibility (via aria-label correlation).
**Action:** Always wrap icon-only buttons in a Tooltip component and ensure they have a descriptive aria-label that reflects the current state (e.g., "Copy" -> "Copied").
