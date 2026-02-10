## 2025-05-18 - Animated Loaders Need Roles
**Learning:** Purely visual loaders like `TypingAnimation` are often missed by screen readers, leaving users unaware of pending actions.
**Action:** Always wrap visual loading indicators in `role="status"` with `aria-live="polite"` and hide decorative elements with `aria-hidden="true"`.
