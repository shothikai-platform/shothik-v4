## 2026-01-22 - API Response Optimization
**Learning:** Returning full documents (like `ResearchChat` with `messages`) in list endpoints is a major performance bottleneck and unnecessary bandwidth usage.
**Action:** Always check schema definitions for heavy fields (arrays, embedded objects) and use `.select()` or projection to exclude them in list/index endpoints.

## 2026-01-22 - IDOR Vulnerability Discovery
**Learning:** Found `get_one_chat` endpoint does not verify if the chat belongs to the authenticated user.
**Action:** Audit all `get_one` or specific resource endpoints for `userId` ownership checks.

## 2026-03-09 - Using .lean() correctly without mongoose-lean-virtuals
**Learning:** While `.lean()` strips virtuals, using `.lean({ virtuals: true })` has no effect and is ignored unless the `mongoose-lean-virtuals` plugin is actively configured on the schema. Therefore, if a schema relies heavily on virtuals (like `id` vs `_id`) and the plugin isn't present, `.lean()` might cause regressions, but passing the flag doesn't fix it. In read-only endpoints returning JSON, standard `.lean()` is the best performance win.
**Action:** Use `.lean()` for simple read-only data, but always check if the schema uses the `mongoose-lean-virtuals` plugin before assuming `.lean({ virtuals: true })` will preserve `id` getters.
