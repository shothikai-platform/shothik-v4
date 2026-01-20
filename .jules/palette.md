## 2025-05-27 - Icon-Only Button Accessibility pattern

**Learning:** I discovered that several icon-only buttons (`ButtonCopyText`, `ButtonDownloadText`) were implemented as raw HTML buttons, bypassing the design system's `Button` component. This led to missing focus rings, missing `type="button"` (risking form submission), and lack of accessible labels.
**Action:** When working on buttons in this codebase, verify they use the shared `Button` component rather than raw HTML to ensure keyboard navigation (focus visible) and accessibility attributes are consistent. Always pair icon-only buttons with Tooltips.
