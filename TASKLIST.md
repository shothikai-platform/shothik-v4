# Shothik v4 - Project Task List

## 🟢 Recently Completed
- **Authentication**:
  - [x] Implement token validation in AuthService (PR #12)
  - [x] Add authentication to Research Chat API (PR #6)
- **Agents & Files**:
  - [x] Combine upload states for all agents (Sheets, Research) (PR #8)
  - [x] Add toast notification for sheet creation failures (PR #11)
- **Marketing Automation**:
  - [x] Add Reports card navigation to AIInsights (PR #9)
  - [x] Implement save to ad functionality in MediaCanvas (PR #10)

## 🔴 CRITICAL PRIORITY - Security Issues
**Must be addressed immediately - Multiple IDOR (Insecure Direct Object Reference) vulnerabilities:**

1. **[CRITICAL] Fix IDOR in chat update** (PR #140) 🛡️
   - Severity: Critical - Users can modify other users' chats
   
2. **[HIGH] Fix IDOR in Create Research Queue Endpoint** (PR #147) 🛡️
   - Severity: High - Unauthorized queue creation
   
3. **[HIGH] Fix IDOR in get_one_chat endpoint** (PR #141) 🛡️
   - Severity: High - Users can access other users' chats
   
4. **[HIGH] Fix IDOR in research chat deletion** (PR #146) 🛡️
   - Severity: High - Users can delete other users' research chats

5. **[MEDIUM] Harden NLP Service CORS Policy** (PR #145) 🛡️
   - Severity: Medium - Strengthen CORS configuration
   
6. **[MEDIUM] Harden CORS Policy** (PR #139) 🛡️
   - Severity: Medium - General CORS hardening

**Action Required**: Review, test, and merge all security PRs before any feature work.

## 🟠 HIGH PRIORITY - PR Backlog & Code Quality

### Performance Optimizations ⚡
Multiple automated performance PRs need review:
- [ ] PR #154: Optimize ResearchAgentPage rendering with memoized ResearchItem (automated) 🤖
- [ ] PR #149: Optimize Research List Rendering with Memoization (automated) 🤖
- [ ] PR #144: Optimized and secured SheetSession list endpoint (automated) 🤖
- [ ] PR #143: Optimize ResearchContentWithReferences rendering (automated) 🤖
- [ ] PR #137: Optimize ResearchProcessLogs re-renders (automated) 🤖

### Accessibility Improvements 🎨
**Note**: Multiple PRs address similar ChatInput improvements - consolidation recommended
- [ ] PR #148 / #142 / #138: ChatInput accessibility improvements (tooltip, ARIA labels) - **DUPLICATE - Choose one**
- [ ] PR #136: Enhanced accessibility for icon-only buttons (automated) 🤖
- [ ] PR #152: Semantic Links for Research Sources (automated) 🎨

### Feature Development
- [ ] PR #150: Implement media editing API integration
- [ ] PR #155: Review branches and protect main branch

## 🟡 In Progress / To Review

### Media Canvas
- [ ] Review PR #14: Implement download in MediaCanvas
- [ ] Review PR #13: Implement media download in MediaCanvasModal
- *Note: PR #13 and #14 seem to address similar functionality. Need to determine which one to proceed with.*

### Documentation
- [ ] PR #4: Replace academic analysis with developer-focused README
- [ ] PR #3: Add docstrings to strengthened types

## 🟢 MEDIUM PRIORITY - Code TODOs

### Error Handling & Monitoring
1. **Error Tracking Integration** (`src/components/presentation/editing/EditingErrorBoundary.tsx`)
   - Add error tracking service (Sentry/LogRocket)
   
2. **Auto-save Conflict Resolution** (`src/hooks/presentation/useAutoSave.ts`)
   - Implement conflict handling during auto-save

### Media Canvas API Integration
3. **MediaCanvasModal API Implementation** (3 TODOs in `MediaCanvasModal.tsx`)
   - Replace placeholder UI with actual API calls
   - Implement save media to ad functionality

### State Management Enhancements
4. **Redux Undo/Redo** (`src/components/presentation/SlidePreview.jsx`)
   - Track changes in Redux for undo/redo
   
5. **History Data Processing** (`src/hooks/orchestrator/usePresentationOrchestrator.js`)
   - Process and dispatch history data to Redux

6. **JSON Tool Output Formatter** (`src/components/presentation/ChatArea.jsx`)
   - Add JSON formatter for tool outputs parsing

## 🔍 VERIFICATION TASKS
1. **Verify Paraphrase Service**:
   - Previous context indicated socket connection issues
   - Re-verify status after recent merges
   
2. **Test Research Chat Auth**:
   - Ensure new `AuthService` validation works with frontend chat components
   
3. **Validate Agent Uploads**:
   - Test file upload in Research Agent and Sheet Agent
   - Confirm "combined state" logic works as expected

## 📊 Summary Statistics
- **Total Open PRs**: 26+ PRs identified
  - 🤖 **Automated PRs**: ~15 (security scanner, performance optimizer, accessibility checker)
  - 👤 **Manual PRs**: ~11 (feature development, documentation)
- **Critical Security Issues**: 6 PRs requiring immediate attention (4 IDOR, 2 CORS)
- **Performance Optimizations**: 5 automated PRs pending review
- **Accessibility Improvements**: 5 PRs pending review (3 duplicates for ChatInput)
- **Code TODOs**: 8 items identified in codebase
- **Feature PRs**: 3 pending review (media editing, downloads, branch protection)

## 🎯 RECOMMENDED ACTION PLAN

### Phase 1: Security (Week 1)
1. Review all security PRs (#140, #147, #141, #146, #145, #139)
2. Test security fixes in staging environment
3. Merge security patches to production

### Phase 2: Code Quality (Week 2)
1. Consolidate duplicate PRs (e.g., multiple chat tooltip PRs)
2. Review and merge performance optimization PRs
3. Review and merge accessibility PRs

### Phase 3: Feature Development (Week 3)
1. Complete media editing API integration (PR #150)
2. Resolve media download PRs (#13, #14)
3. Implement remaining TODOs for MediaCanvas

### Phase 4: Documentation & Testing (Week 4)
1. Update README with developer-focused content (PR #4)
2. Add comprehensive docstrings (PR #3)
3. Execute verification tasks
4. Set up branch protection rules (PR #155)

## 📝 Notes
- The "staticv4" branch reference from user instructions is treated as `main` for this workspace
- All core feature branches have been merged into `main`
- **URGENT**: Security vulnerabilities must be addressed before feature development
- Consider implementing automated security scanning in CI/CD pipeline

### About Automated PRs 🤖
- Many PRs are created by bots (Sentinel 🛡️, Bolt ⚡, Palette 🎨)
- **Sentinel**: Security vulnerability scanner
- **Bolt**: Performance optimization suggestions
- **Palette**: Accessibility improvements
- **Action**: Manual review required for all automated PRs - they may have false positives or breaking changes
- **Recommendation**: Consolidate duplicate automated PRs before merging
