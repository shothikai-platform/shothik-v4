
## 2025-05-18 - Icon-Only Button Accessibility Pattern
**Learning:** Icon-only buttons (like Copy/Download) are a common accessibility gap. Sighted users often need tooltips to confirm the action, while screen readers need dynamic `aria-label`s that reflect the current state (e.g., "Copy to clipboard" -> "Copied!").
**Action:** Use a standardized pattern: Wrap the button in a `Tooltip` component (using `asChild`), add `type="button"`, and sync the `aria-label` with the tooltip text state.
