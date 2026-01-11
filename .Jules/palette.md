## 2024-05-23 - Accessible Icon-Only Buttons

**Learning:** Icon-only buttons (like "Copy" or "Download") are common in this UI but often lack accessible names. A consistent pattern of wrapping them in `Tooltip` + `TooltipTrigger (asChild)` and adding a dynamic `aria-label` provides both visual and screen reader accessibility.

**Action:** When encountering icon-only buttons, always wrap them in the `Tooltip` component (which includes the provider) and ensure the inner button has an `aria-label` that reflects its current state (e.g., "Copy" vs "Copied"). Use `asChild` on the trigger to prevent invalid DOM nesting (button inside button).
