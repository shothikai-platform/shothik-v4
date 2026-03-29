## 2024-05-22 - Icon-Only Buttons and ARIA Labels
**Learning:** Icon-only buttons (like Send, Close, Edit) are often implemented without accessible names, making them invisible or confusing to screen reader users. The "Send" button in chat interfaces is a frequent offender.
**Action:** Always verify icon-only buttons have an `aria-label` or `title` describing their action, not just the icon name.
