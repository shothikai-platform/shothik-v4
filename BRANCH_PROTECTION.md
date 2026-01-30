# Branch Protection and Management Guidelines

## Branch Review Summary

### Current Repository Status
- **Repository**: shothikai-platform/shothik-v4
- **Default Branch**: 7e32e45b2eebee010d26a0a62373c3f62eaaae66 (main/staticv4)
- **Total Branches**: 31 branches (as of January 30, 2026)

### Branch Inventory

#### Active Development Branches
The repository contains numerous feature and optimization branches, primarily created through automated tools (Bolt):

**Performance Optimization Branches** (30 branches):
1. `add-research-upload-mutation-8922117715390414976`
2. `add-sheets-upload-mutation-15924769773720138589`
3. `bolt/memoize-markdown-parsing-11434266460803156846`
4. `bolt/optimize-research-content-12277893693274310574`
5. `bolt/optimize-research-content-renders-6197708597603259668`
6. `bolt/optimize-research-list-2677633562625938615`
7. `bolt/optimize-research-list-rendering-882506389161588932`
8. `bolt/optimize-research-process-logs-13030714757679749896`
9. `bolt/optimize-sheet-chats-1438224113730215634`
10. `bolt/optimize-sheet-session-list-5979693411539053408`
11. `bolt/optimize-sheet-sessions-fetch-9719167233441051908`
12. `bolt-chat-area-optimization-14947670836897310283`
13. `bolt-chat-dedup-optimization-12592149229121061537`
14. `bolt-chat-performance-optimization-15965967965368602159`
15. `bolt-input-optimization-6126686884817481092`
16. `bolt-marked-performance-optimization-14352992248981790442`
17. `bolt-optimization-sheetsession-4116734892452025789`
18. `bolt-optimize-chat-area-2184010559583306266`
19. `bolt-optimize-chat-area-5481821175645289601`
20. `bolt-optimize-chat-area-7028853577922572044`
21. `bolt-optimize-chat-list-15399529183283299132`
22. `bolt-optimize-chat-lookup-5488241584395519902`
23. `bolt-optimize-research-agent-page-6837008534467295461`
24. `bolt-optimize-research-content-2921298977372420927`
25. `bolt-optimize-research-content-parsing-3362740740496515552`
26. `bolt-optimize-research-item-render-16490825270488264427`
27. `bolt-optimize-research-logs-10467543325828170030`
28. `bolt-optimize-research-logs-11741140419576328868`
29. `bolt-optimize-research-process-logs-13714497564846563873`
30. `bolt-optimize-research-process-logs-3800718070880799012`

**Current Work**:
- `copilot/protect-main-branch` - Branch protection setup (this branch)

### Branch Protection Status
- **Main Branch Protected**: ❌ No (needs protection)
- **All Feature Branches Protected**: ❌ No (not required for feature branches)

## Recommended Branch Protection Rules

### Main/Production Branch Protection

The main branch should have the following protection rules enabled:

#### 1. **Require Pull Request Reviews**
- ✅ Require at least 1 approval before merging
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (if CODEOWNERS file exists)

#### 2. **Require Status Checks**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required checks should include:
  - Build verification (if CI/CD is configured)
  - Test suite (Playwright tests, unit tests)
  - Code quality checks (ESLint, TypeScript compilation)

#### 3. **Require Conversation Resolution**
- ✅ Require all conversations to be resolved before merging

#### 4. **Require Signed Commits**
- ⚠️ Optional: Enable if team uses GPG signing

#### 5. **Require Linear History**
- ✅ Prevent merge commits, require rebase or squash merging
- This keeps the main branch history clean and linear

#### 6. **Restrict Force Push**
- ✅ Do not allow force pushes to the main branch
- This prevents accidental history rewrites

#### 7. **Restrict Deletions**
- ✅ Do not allow deletion of the main branch

#### 8. **Restrict Who Can Push**
- ✅ Only allow administrators to bypass branch protection
- ⚠️ Consider requiring pull requests even for administrators

## Implementation Steps

### Step 1: Enable Branch Protection (GitHub UI)

1. Navigate to: `https://github.com/shothikai-platform/shothik-v4/settings/branches`
2. Click "Add branch protection rule"
3. Enter branch name pattern: `main` or `staticv4` (depending on your default branch)
4. Configure the following settings:

   **Protect matching branches:**
   - [x] Require a pull request before merging
     - [x] Require approvals: 1
     - [x] Dismiss stale pull request approvals when new commits are pushed
     - [ ] Require review from Code Owners
   - [x] Require status checks to pass before merging
     - [x] Require branches to be up to date before merging
     - Add required status checks (e.g., `build`, `test`, `lint`)
   - [x] Require conversation resolution before merging
   - [ ] Require signed commits (optional)
   - [x] Require linear history
   - [x] Do not allow bypassing the above settings
   - [x] Restrict who can push to matching branches
   - [x] Do not allow force pushes
   - [x] Do not allow deletions

5. Click "Create" or "Save changes"

### Step 2: Configure Status Checks (GitHub Actions)

Ensure the following workflows are configured to run on pull requests:

1. **Build Workflow** (`build_nlp_service.yml`)
2. **Test Workflow** (`playwright.yml`)
3. **Lint Workflow** (if available)

Example workflow configuration:
```yaml
name: CI/CD Pipeline
on:
  pull_request:
    branches: [main, staticv4]
  push:
    branches: [main, staticv4]
```

### Step 3: Clean Up Stale Branches

Review and delete merged/stale branches:

```bash
# List merged branches
git branch --merged main

# Delete merged branches (after verification)
git branch -d <branch-name>
git push origin --delete <branch-name>
```

**Recommendation**: Consider implementing a branch cleanup policy:
- Delete branches automatically after PR merge
- Set up a scheduled workflow to identify and notify about stale branches (>30 days old)

## Branch Naming Conventions

To maintain consistency, enforce the following naming conventions:

- `feature/<description>` - New features
- `bugfix/<description>` - Bug fixes
- `hotfix/<description>` - Critical production fixes
- `release/<version>` - Release branches
- `bolt/<description>` - Automated tool branches
- `copilot/<description>` - AI-assisted development branches

## Monitoring and Maintenance

### Weekly Tasks
- [ ] Review open pull requests
- [ ] Check for stale branches (>30 days without activity)
- [ ] Verify branch protection rules are active

### Monthly Tasks
- [ ] Audit branch protection settings
- [ ] Review and update required status checks
- [ ] Clean up merged branches
- [ ] Update this documentation as needed

## Security Considerations

1. **Secrets Management**: Never commit secrets or API keys
2. **Code Review**: Always require code review for main branch merges
3. **Dependency Updates**: Regularly update dependencies and review security alerts
4. **Access Control**: Limit who can approve and merge PRs

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/securing-your-repository)
- [Git Branch Management Best Practices](https://nvie.com/posts/a-successful-git-branching-model/)

## Notes

- This repository appears to use automated tools (Bolt) for creating optimization branches
- Consider implementing a branch lifecycle policy for automated branches
- The current branch count (31 branches) suggests a need for regular cleanup
- Ensure all team members are aware of the branch protection rules and workflows

---

**Last Updated**: January 30, 2026
**Maintained By**: DevOps/Platform Team
