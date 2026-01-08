## 2024-02-21 - ButtonCopyText Accessibility
**Learning:** Icon-only buttons (like copy/download actions) often lack `aria-label` or tooltips, making them inaccessible.
**Action:** When creating or modifying icon-only buttons, always:
1.  Add `aria-label="Action description"`.
2.  Wrap in a `Tooltip` component to explain the action visually on hover.
3.  Use `TooltipTrigger asChild` to avoid invalid DOM nesting (button inside button).
