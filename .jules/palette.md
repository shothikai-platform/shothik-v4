## 2024-06-18 - Added ARIA label to mobile menu button
**Learning:** Found two icon-only mobile menu buttons in the header component (`<Menu />` and `<AlignRight />`) lacking proper context for screen readers. Since these act as interactive triggers to open the mobile menu drawer, they require explicit descriptive labels to be accessible.
**Action:** Always verify that buttons containing only icons (like hamburger menus) have explicit `aria-label` attributes to maintain accessibility standards.
