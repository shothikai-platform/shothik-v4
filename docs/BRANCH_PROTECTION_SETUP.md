# Branch Protection Setup - Quick Start Guide

This guide provides step-by-step instructions for setting up branch protection rules for the Shothik V4 repository.

## Prerequisites

- Administrator access to the repository
- Understanding of your team's workflow requirements

## Step 1: Access Branch Protection Settings

1. Navigate to the repository: https://github.com/shothikai-platform/shothik-v4
2. Click on **Settings** (requires admin access)
3. In the left sidebar, click **Branches** under "Code and automation"
4. Click **Add branch protection rule** button

## Step 2: Configure Branch Name Pattern

In the "Branch name pattern" field, enter:
```
main
```

Or if your default branch is named differently (e.g., `staticv4`), enter that name instead.

## Step 3: Enable Protection Rules

### Required Status Checks
☑️ **Require status checks to pass before merging**
   - ☑️ Require branches to be up to date before merging
   - Search and select the following status checks:
     - `lint-check`
     - `security-check`
     - `validate-pr`
     - `enforce-linear-history`
     - Any other CI/CD checks from your workflows

### Pull Request Reviews
☑️ **Require a pull request before merging**
   - Number of required approvals: `1` (adjust based on team size)
   - ☑️ Dismiss stale pull request approvals when new commits are pushed
   - ☑️ Require review from Code Owners (if using CODEOWNERS file)

### Conversation Resolution
☑️ **Require conversation resolution before merging**

### Commit Signing (Optional but Recommended)
☐ **Require signed commits** (enable if your team uses GPG signing)

### Linear History
☑️ **Require linear history**
   - This prevents merge commits and requires squash or rebase merging

### Force Push Protection
☑️ **Do not allow force pushes**
   - Important: This prevents accidental history rewrites

### Deletion Protection
☑️ **Do not allow deletions**
   - Prevents accidental branch deletion

### Bypass Settings
☐ **Do not allow bypassing the above settings**
   - Recommended: Keep this enabled to enforce rules for everyone

### Restrict Push Access (Optional)
☑️ **Restrict who can push to matching branches**
   - Add specific users or teams who can push directly
   - Typically, only CI/CD systems should have this access

## Step 4: Save the Rule

Click **Create** or **Save changes** at the bottom of the page.

## Step 5: Verify the Protection

1. Navigate back to **Settings** > **Branches**
2. You should see your new protection rule listed
3. The main branch should now show a shield icon indicating it's protected

## Step 6: Test the Protection

1. Create a test branch: `git checkout -b test/branch-protection`
2. Make a small change and commit it
3. Push the branch: `git push origin test/branch-protection`
4. Try to push directly to main: `git push origin main`
   - This should fail with a protection error
5. Create a pull request instead and verify all checks run

## Common Configuration Scenarios

### Small Team (2-5 developers)
- Required approvals: 1
- Required status checks: Basic (lint, test)
- Allow force push: No
- Code owners: Optional

### Medium Team (6-20 developers)
- Required approvals: 2
- Required status checks: Comprehensive (lint, test, security, build)
- Allow force push: No
- Code owners: Recommended
- Require conversation resolution: Yes

### Large Team (20+ developers)
- Required approvals: 2-3
- Required status checks: All available
- Allow force push: No
- Code owners: Required
- Require conversation resolution: Yes
- Restrict push to specific teams only

## Troubleshooting

### Issue: Status checks are not showing up
**Solution**: Ensure your GitHub Actions workflows are configured to run on `pull_request` events for the protected branch.

### Issue: Can't merge despite all checks passing
**Solution**: Check if all conversations are resolved and required approvals are obtained.

### Issue: Need to bypass protection for emergency fix
**Solution**: 
1. Temporarily disable the protection rule (requires admin)
2. Make the emergency fix
3. Re-enable the protection rule immediately after
4. Document the bypass in incident log

### Issue: Pull requests are blocked by outdated branch
**Solution**: Update your branch with the latest changes from main:
```bash
git checkout your-branch
git fetch origin
git rebase origin/main  # or git merge origin/main
git push --force-with-lease origin your-branch
```

## Additional Resources

- [Detailed Branch Protection Documentation](./BRANCH_PROTECTION.md)
- [GitHub Official Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Code Owners Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

## Next Steps

After setting up branch protection:

1. ✅ Communicate the new rules to all team members
2. ✅ Update your team's workflow documentation
3. ✅ Configure the CODEOWNERS file with actual team names
4. ✅ Set up required status checks in GitHub Actions
5. ✅ Monitor the first few PRs to ensure smooth adoption
6. ✅ Collect feedback and adjust rules as needed

---

**Last Updated**: January 30, 2026
**Maintained By**: DevOps Team
