## 2025-05-23 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like Copy/Download) in `src/components/buttons` were missing `aria-label` and `Tooltip`. This is a common pattern to watch for.
**Action:** When creating or spotting icon-only buttons, always wrap them in `Tooltip` component and ensure `aria-label` is present and dynamic if state changes.
