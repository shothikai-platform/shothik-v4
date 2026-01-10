## 2025-02-23 - Icon-Only Buttons Accessibility
**Learning:** Many utility buttons (Copy, Download) were icon-only without `aria-label` or tooltips, making them inaccessible to screen readers and potentially unclear to sighted users.
**Action:** When creating icon-only buttons, always include an `aria-label` describing the action and wrap the button in a `Tooltip` component to provide visual context on hover. Ensure the label and tooltip text update dynamically if the button state changes (e.g., "Copy" -> "Copied").
