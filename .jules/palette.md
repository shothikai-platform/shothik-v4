## 2025-02-18 - Tooltip Accessibility Wrapper
**Learning:** Icon-only buttons (like "Copy") are a common accessibility gap. Wrapping them in a `Tooltip` with a dynamic `aria-label` provides a huge win for both screen readers and visual users with minimal code.
**Action:** When spotting raw `button` elements with icons, immediately wrap in `Tooltip` + `TooltipTrigger` and sync `aria-label` with the tooltip text.
