## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Tooltips on Disabled Buttons
**Learning:** Disabled buttons in Radix/Shadcn don't trigger mouse events for tooltips.
**Action:** Wrap disabled buttons in a `span` with `tabIndex={0}` and `focus-visible` styles to ensure tooltips appear on hover and focus.

## 2026-02-16 - Redundant TooltipProvider
**Learning:** The `Tooltip` component in `src/components/ui/tooltip` already includes `TooltipProvider`, so wrapping it in another `TooltipProvider` is redundant.
**Action:** Use `Tooltip` directly. Only use `TooltipProvider` if you need to override global tooltip settings (like `delayDuration`).
