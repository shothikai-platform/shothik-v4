## 2024-10-24 - Radix Tooltip Accessibility on Disabled Elements
**Learning:** In this Radix/Shadcn setup, disabled buttons block mouse/keyboard events, preventing tooltips from appearing.
**Action:** Wrap disabled buttons inside tooltips with a `<span tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-ring">` to maintain hover and focus visibility.
