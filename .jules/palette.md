## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-02-18 - Accessible File Uploads
**Learning:** File inputs often lack focus visibility and sometimes nest inputs inside button wrappers (invalid HTML), causing screen readers to miss them and breaking keyboard navigation. Hiding them with `opacity-0` can still lack focus styles.
**Action:** Use `sr-only` instead of `opacity-0` for visually hidden file inputs. Wrap them directly in a `<label>`, avoid wrapping inside `<Button>`, and use Tailwind's `has-[:focus-visible]:ring` on the wrapper to ensure focus states appear.
