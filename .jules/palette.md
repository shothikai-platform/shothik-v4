## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Custom File Upload Keyboard Accessibility
**Learning:** Hiding file inputs with absolute positioning and zero opacity breaks native keyboard focus rings on the wrapping custom label.
**Action:** Use `sr-only` to visually hide the input, and use Tailwind's `has-[:focus-visible]:ring-2` on the wrapping `<label>` to trigger visual focus states when the hidden input receives focus via keyboard navigation.
