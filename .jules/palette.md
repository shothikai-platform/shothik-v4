## 2026-01-19 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like Copy/Download) often lack accessible names and rely on visual cues (icons) that screen readers cannot interpret. Dynamic state changes (e.g., "Copy" -> "Copied") must be communicated via `aria-label` and visual tooltips.
**Action:** Always wrap icon-only buttons in a `Tooltip` and sync the `aria-label` with the tooltip text and button state.
