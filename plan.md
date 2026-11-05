Plan:
1. In `src/components/tools/research/CombinedActions.jsx`:
Fix the double-focusing accessibility issue with the disabled Thumbs Up and Thumbs Down buttons that are wrapped in Tooltips, per instructions:
"disabled icon-only buttons with tooltips must be wrapped in a span with className="focus-visible:ring-2 focus-visible:ring-ring". Crucially, to prevent double-focusing for keyboard users when the button is active, apply tabIndex conditionally (e.g., tabIndex={isDisabled ? 0 : undefined})."

I'll use `replace_with_git_merge_diff` on `src/components/tools/research/CombinedActions.jsx`.
