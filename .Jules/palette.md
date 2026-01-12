## 2026-01-12 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons often lack accessible labels and tooltips, confusing users and screen readers.
**Action:** Wrap icon-only buttons in `Tooltip` components and add dynamic `aria-label` attributes that reflect the current state (e.g., "Copy" -> "Copied").
