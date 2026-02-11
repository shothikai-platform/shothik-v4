## 2024-05-23 - Accessibility of UploadAvatar

**Learning:** Custom file upload triggers using `div` with `onClick` are inaccessible to keyboard users and screen readers because the `input` is hidden and the trigger is not focusable.
**Action:** Replace `div` wrappers with semantic `<label>` elements linked to the input via `htmlFor`. Use `sr-only` class on the input to hide it visually but keep it in the accessibility tree. Add `focus-within` styles to the label to show focus state when the input is focused via keyboard.
