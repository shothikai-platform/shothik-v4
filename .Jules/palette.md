## 2024-05-23 - Icon-only buttons accessibility pattern
**Learning:** Custom icon-only buttons in `src/components/buttons` (e.g., `ButtonCopyText`, `ButtonDownloadText`) often miss ARIA labels and tooltips, unlike `Button` component usages. This makes them invisible to screen readers and unclear to users.
**Action:** When creating or modifying icon-only buttons, always ensure they have an `aria-label` and are wrapped in a `Tooltip` for better discoverability.
