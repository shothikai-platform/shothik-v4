## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.
## 2026-03-17 - Adding ARIA labels to icon-only modal buttons
**Learning:** Icon-only close buttons in dynamic menus and sheets (like `LanguageMenus`) are frequently missing ARIA labels, creating significant accessibility barriers for screen reader users trying to dismiss overlays.
**Action:** Always add an `aria-label` (e.g., `aria-label="Close"`) to `<button>` elements that only contain an icon component (like `<X />`), especially in structural UI elements like modals, dialogs, and sheets.
