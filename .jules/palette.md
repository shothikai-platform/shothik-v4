## 2025-02-17 - Prop Spreading and ARIA Attributes
**Learning:** When building reusable components that construct their own ARIA attributes (like `aria-describedby`) while also accepting `...other` props, it is critical to destructure the specific ARIA attribute from `other` before spreading. Failure to do so causes the spread prop to blindly override the component's internal accessibility logic.
**Action:** Always destructure `aria-*` attributes that the component modifies internally before spreading `...other`.
