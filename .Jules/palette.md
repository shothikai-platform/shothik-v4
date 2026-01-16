## 2024-05-22 - Icon-only buttons lacking accessibility
**Learning:** Custom icon-only buttons (like `ButtonCopyText`, `ButtonDownloadText`) were implemented as raw `button` elements with no `aria-label` or tooltips, making them invisible to screen readers and ambiguous to users.
**Action:** Wrap these buttons in `Tooltip` with `asChild`, and add dynamic `aria-label` that reflects the state (e.g., "Copy" -> "Copied").
