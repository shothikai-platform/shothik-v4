## 2026-01-17 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like Copy/Download) are often implemented as raw buttons without labels. The project has a reusable `Tooltip` component in `src/components/ui/tooltip` that should be used to wrap these buttons.
**Action:** Always wrap icon-only buttons in a `Tooltip` with a dynamic `aria-label` and visual tooltip text that reflects the button's state (e.g., "Copy" -> "Copied"). Use `type="button"` to prevent form submission.
