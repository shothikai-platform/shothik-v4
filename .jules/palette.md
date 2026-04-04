## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2025-04-04 - Accessible Custom File Uploads
**Learning:** Rendering an unstyled `<input type="file">` inside a custom `<label>` using standard classes like `absolute opacity-0` breaks keyboard focus styling entirely since the invisible input takes focus but does not show it.
**Action:** When building reusable custom file upload components, style the `<label>` wrapper and apply `has-[:focus-visible]:ring-2` (or similar focus classes), then position the `<input type="file">` as `className="sr-only"` inside it to pass the focus style safely and cleanly to the wrapper.
