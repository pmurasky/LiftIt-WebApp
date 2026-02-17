#!/bin/bash
# Script to create GitHub labels from labels.yml
# Requires: GitHub CLI (gh) installed and authenticated
# Usage: ./.github/scripts/setup-labels.sh

set -e

REPO="pmurasky/LiftIt-WebApp"
LABELS_FILE=".github/labels.yml"

echo "Setting up GitHub labels for $REPO"
echo ""

if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed."
    echo "Install it with: sudo apt install gh"
    echo "Or visit: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo "Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

if [ ! -f "$LABELS_FILE" ]; then
    echo "Labels file not found: $LABELS_FILE"
    exit 1
fi

echo "Syncing labels with github-label-sync..."
echo ""

GITHUB_ACCESS_TOKEN="$(gh auth token)" npx -y github-label-sync --labels "$LABELS_FILE" "$REPO"

echo ""
echo "Labels setup complete"
echo "View labels at: https://github.com/$REPO/labels"
