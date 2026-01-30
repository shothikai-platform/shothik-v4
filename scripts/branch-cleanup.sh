#!/bin/bash

# Branch Cleanup Helper Script
# This script helps identify stale branches that may need cleanup
# It does NOT delete branches automatically - it only reports them

set -e

echo "========================================="
echo "Branch Cleanup Helper for Shothik V4"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STALE_DAYS=30
MAIN_BRANCH="main"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Fetch latest data from remote
echo -e "${BLUE}Fetching latest data from remote...${NC}"
git fetch --prune

echo ""
echo "========================================="
echo "Branch Analysis Report"
echo "========================================="
echo ""

# Get current date in seconds
CURRENT_DATE=$(date +%s)
STALE_THRESHOLD=$((CURRENT_DATE - (STALE_DAYS * 86400)))

# Function to check if a branch is merged
is_merged() {
    local branch=$1
    if git merge-base --is-ancestor "origin/$branch" "origin/$MAIN_BRANCH" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Initialize counters
TOTAL_BRANCHES=0
STALE_BRANCHES=0
MERGED_BRANCHES=0
PROTECTED_BRANCHES=0

echo -e "${BLUE}1. Merged Branches (Safe to Delete)${NC}"
echo "-----------------------------------"

for branch in $(git branch -r | grep -v HEAD | sed 's/origin\///' | grep -v "^$MAIN_BRANCH$"); do
    TOTAL_BRANCHES=$((TOTAL_BRANCHES + 1))
    
    if is_merged "$branch"; then
        MERGED_BRANCHES=$((MERGED_BRANCHES + 1))
        LAST_COMMIT_DATE=$(git log -1 --format=%ct "origin/$branch" 2>/dev/null || echo "0")
        DAYS_OLD=$(( (CURRENT_DATE - LAST_COMMIT_DATE) / 86400 ))
        
        echo -e "${GREEN}✓${NC} $branch (merged, last updated $DAYS_OLD days ago)"
    fi
done

if [ $MERGED_BRANCHES -eq 0 ]; then
    echo "  No merged branches found."
fi

echo ""
echo -e "${YELLOW}2. Stale Branches (>$STALE_DAYS days old, not merged)${NC}"
echo "-----------------------------------"

for branch in $(git branch -r | grep -v HEAD | sed 's/origin\///' | grep -v "^$MAIN_BRANCH$"); do
    if ! is_merged "$branch"; then
        LAST_COMMIT_DATE=$(git log -1 --format=%ct "origin/$branch" 2>/dev/null || echo "0")
        
        if [ $LAST_COMMIT_DATE -lt $STALE_THRESHOLD ]; then
            STALE_BRANCHES=$((STALE_BRANCHES + 1))
            DAYS_OLD=$(( (CURRENT_DATE - LAST_COMMIT_DATE) / 86400 ))
            LAST_AUTHOR=$(git log -1 --format=%an "origin/$branch" 2>/dev/null || echo "Unknown")
            
            echo -e "${YELLOW}⚠${NC} $branch"
            echo "   Last updated: $DAYS_OLD days ago"
            echo "   Last author: $LAST_AUTHOR"
            echo ""
        fi
    fi
done

if [ $STALE_BRANCHES -eq 0 ]; then
    echo "  No stale branches found."
fi

echo ""
echo -e "${BLUE}3. Protected Branches${NC}"
echo "-----------------------------------"
echo -e "${GREEN}✓${NC} $MAIN_BRANCH (protected)"
PROTECTED_BRANCHES=1

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo "Total remote branches: $TOTAL_BRANCHES"
echo "Merged branches (safe to delete): $MERGED_BRANCHES"
echo "Stale branches (>$STALE_DAYS days): $STALE_BRANCHES"
echo "Protected branches: $PROTECTED_BRANCHES"
echo ""

if [ $MERGED_BRANCHES -gt 0 ]; then
    echo -e "${GREEN}Recommendation:${NC} Review and delete merged branches"
    echo ""
    echo "To delete a merged branch, run:"
    echo "  git push origin --delete <branch-name>"
    echo ""
fi

if [ $STALE_BRANCHES -gt 0 ]; then
    echo -e "${YELLOW}Warning:${NC} Found $STALE_BRANCHES stale branch(es)"
    echo "Review these branches with their authors before deletion."
    echo ""
fi

echo "========================================="
echo "Top 10 Most Active Branches"
echo "========================================="

for branch in $(git for-each-ref --sort=-committerdate refs/remotes/ --format='%(refname:short)' | grep -v HEAD | sed 's/origin\///' | head -10); do
    LAST_COMMIT=$(git log -1 --format="%cr" "origin/$branch" 2>/dev/null || echo "unknown")
    LAST_AUTHOR=$(git log -1 --format=%an "origin/$branch" 2>/dev/null || echo "Unknown")
    echo "• $branch"
    echo "  Last commit: $LAST_COMMIT by $LAST_AUTHOR"
done

echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""
echo "1. Review merged branches and delete them if they're no longer needed"
echo "2. Contact authors of stale branches to check if they're still needed"
echo "3. Update branch protection rules if necessary"
echo "4. Run this script regularly (e.g., monthly) for maintenance"
echo ""
echo "For more information, see:"
echo "  - docs/BRANCH_PROTECTION_SETUP.md"
echo "  - BRANCH_PROTECTION.md"
echo ""
