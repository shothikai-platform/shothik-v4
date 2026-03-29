## 2025-02-15 - Tooltips on Disabled Buttons with Proper Keyboard Nav
**Learning:** Radix UI Tooltips do not work on disabled buttons because they don't emit pointer events. Wrapping in a `span` works but creates double tab stops (span + button) when the button is enabled.
**Action:** When wrapping a button in a `span` for tooltips, conditionally set `tabIndex` on the `span`: `tabIndex={isDisabled ? 0 : -1}`. This ensures the wrapper is focusable (triggering tooltip) only when the button is disabled, and skipped when the button is enabled (and focusable itself).
