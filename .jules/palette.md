## 2024-03-20 - Custom File Upload Keyboard Accessibility
**Learning:** Using a hidden input within a div and an `onClick` handler (`document.getElementById("id").click()`) makes the file upload completely inaccessible to keyboard users because `hidden` inputs are removed from the focus order.
**Action:** When creating custom file upload buttons, wrap the input in a `<label>`, use the `sr-only` class on the input instead of `hidden` so it receives focus, and apply `focus-within:ring-2` to the `<label>` to visually indicate keyboard focus.
