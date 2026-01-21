## 2025-02-22 - Icon-Only Button Accessibility Pattern
**Learning:** Multiple icon-only buttons (Copy, Download) were implemented as raw `<button>` elements lacking `aria-label` and tooltips. This pattern makes the UI inaccessible to screen readers and less intuitive for sighted users.
**Action:** When creating or modifying icon-only buttons, always wrap them in the existing `Tooltip` component and provide a descriptive, dynamic `aria-label`.
