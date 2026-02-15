## 2024-05-24 - Accessible File Upload Pattern
**Learning:** Custom file inputs often break accessibility by hiding the native input entirely. Using a semantic `<label>` wrapper with `focus-within` styles and an `sr-only` input ensures keyboard users can perceive focus, while `useId` prevents ID collisions in reusable components.
**Action:** Always wrap custom file inputs in a `<label>` and use `focus-within` for focus states. Use `useId` for unique IDs.

## 2024-05-24 - Helper Text vs Error Message
**Learning:** The `UploadAvatar` component conflated helper text with error messages, styling both as `text-destructive` (red). This confused users by making neutral instructions look like errors.
**Action:** Separate `helperText` (neutral, e.g., `text-muted-foreground`) from `errorMessage` (critical, e.g., `text-destructive`).
