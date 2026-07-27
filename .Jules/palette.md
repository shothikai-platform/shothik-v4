## 2024-05-24 - Tooltip Accessibility
**Learning:** Disabled buttons in Radix/Shadcn do not trigger mouse events, meaning tooltips are inaccessible via hover or keyboard when wrapping a disabled button. The standard workaround is wrapping the disabled element in a focusable span.
**Action:** When adding tooltips to disabled elements, wrap the trigger button in a `<span tabIndex={0} className="focus-visible:ring-2 focus-visible:ring-ring">`.
