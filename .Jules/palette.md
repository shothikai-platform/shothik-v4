## 2026-01-15 - Icon-Only Button Pattern
**Learning:** Icon-only buttons (`ButtonCopyText`, `ButtonDownloadText`) were missing `aria-label` and tooltips, confusing users and screen readers.
**Action:** Standardize all icon-only buttons to use the `Button` component (size="icon", variant="ghost") wrapped in `Tooltip` (trigger asChild) with dynamic `aria-label` reflecting state changes (e.g., "Copy" -> "Copied").
