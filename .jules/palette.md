## 2025-02-18 - Tooltip & ARIA on Icon-Only Buttons
**Learning:** Icon-only buttons (like Copy/Download) are inaccessible without `aria-label` and confusing without Tooltips. Adding them is a high-impact, low-risk win.
**Action:** Always wrap icon-only buttons in `Tooltip` and sync `aria-label` with the tooltip text (including state changes like "Copied!").

## 2025-02-18 - Vitest React Import
**Learning:** Vitest tests fail with `ReferenceError: React is not defined` if `import React from 'react'` is missing in the component file, even if Next.js App Router doesn't require it.
**Action:** Explicitly import React in components being unit tested.
