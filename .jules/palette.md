## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Double Focus Traps with Tooltip Wrappers
**Learning:** When wrapping natively focusable, occasionally-disabled elements (like a `Button`) in a Shadcn `TooltipTrigger` combined with a `span` or `div` wrapper to catch events on the disabled element, setting a static `tabIndex={0}` on the wrapper creates a double-focus trap when the child button is active. Keyboard users must tab twice to reach and trigger the actual interactive element.
**Action:** Always make the wrapper's `tabIndex` dynamic based on the child's disabled state: `tabIndex={isDisabled ? 0 : -1}`. This ensures the wrapper is only focusable when the child button cannot accept focus.
