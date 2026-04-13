💡 What: Refactored file upload components to correctly use `<label>` instead of `<button>` wrappers for visually hidden file inputs (`sr-only`), and added keyboard focus visibility using Tailwind's `has-[:focus-visible]` utilities. Also added `aria-label`s.

🎯 Why: Nesting `<input>` within a `<button>` is invalid HTML and breaks keyboard focus and screen reader announcements. Furthermore, using `opacity-0` often lacks focus indicators. This change ensures that when users tab through the document, the upload button shows a clear focus ring, and screen readers can properly identify and announce the input.

📸 Before/After: (Not required, as this primarily affects non-visual keyboard and screen reader states)

♿ Accessibility:
- Replaced `<Button>` wrapping the file input with a semantic `<label>`.
- Replaced `opacity-0` with `sr-only` for proper hiding.
- Added `aria-label="Upload document"` to the hidden inputs.
- Applied `has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2` to the parent wrapper so the button visibly highlights when the internal input receives keyboard focus.
