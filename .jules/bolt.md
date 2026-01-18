## 2024-05-23 - Syntax Errors in Truncated Files
**Learning:** Some files in the codebase (e.g., `ReferenceModal.jsx`, `ResearchContentWithReferences.jsx`) contained syntax errors due to truncated `console.log` statements or missing brackets. This suggests a previous mass-edit or merge issue.
**Action:** When a build or test fails with syntax errors in files you didn't touch, inspect them for truncated code or malformed object literals, especially around `console.log` or debugging patterns.
