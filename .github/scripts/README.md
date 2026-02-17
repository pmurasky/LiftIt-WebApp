# GitHub Issues Setup Scripts

This directory contains scripts to help set up GitHub Issues for the LiftIt-WebApp project.

## Prerequisites

- GitHub CLI (`gh`): Install with `sudo apt install gh` or visit [cli.github.com](https://cli.github.com/)
- Authentication: Run `gh auth login` to authenticate with GitHub

## Scripts

### `setup-labels.sh`

Creates all project labels from `.github/labels.yml` using `github-label-sync`.

Usage:

```bash
./.github/scripts/setup-labels.sh
```

This will create or update labels for type, priority, status, area, effort, and special categories.

## Issue Templates

The following issue templates are available:

- `🐛 Bug Report`
- `✨ Feature Request`
- `📋 Engineering Standards Violation`

## Next Steps

1. Run `./.github/scripts/setup-labels.sh`
2. Review labels at `https://github.com/pmurasky/LiftIt-WebApp/labels`
3. Create issues via `https://github.com/pmurasky/LiftIt-WebApp/issues/new/choose`
