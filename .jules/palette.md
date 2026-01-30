## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-23 - Semantic Links for Clickable Cards
**Learning:** Implementing result cards as `div`s with `onClick` breaks standard browser behaviors like "Open in new tab" and requires manual keyboard handling.
**Action:** Use semantic `<a>` tags wrapping the card content for navigation items. This provides free accessibility, focus management, and SEO benefits.
