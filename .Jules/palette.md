# Palette's Journal

## 2025-02-20 - Accessible Form Inputs (RHFTextField)
**Learning:** `RHFTextField` components were missing `aria-invalid` and `aria-describedby` attributes. This meant screen reader users were not informed when an input had an error or what the error message was, despite it being visible on screen.
**Action:** Always ensure form inputs with validation are programmatically linked to their error messages using `aria-describedby`. Add `aria-invalid="true"` when the field has an error. Use `role="alert"` on the error message container for immediate feedback.
**Constraint:** The component currently uses the field `name` as the DOM `id`. This risks collision if multiple forms on the same page share field names (e.g. "email"). A future refactor should introduce `React.useId()` for unique ID generation while maintaining label association.
