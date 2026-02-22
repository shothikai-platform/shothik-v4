## 2024-05-22 - Suggestion Component Accessibility
**Learning:** The `Suggestion` component used `span` elements for interactive items, preventing keyboard access.
**Action:** Replaced `span` with `button`, added `type="button"`, and included `focus-visible` styles. Always use native interactive elements for click actions.
