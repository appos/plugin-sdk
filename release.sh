#!/usr/bin/env bash
set -euo pipefail

# release.sh — build, version-bump, publish, and tag all packages
#
# Usage: ./release.sh <version>
#   e.g. ./release.sh 2.4.1

if [ $# -ne 1 ]; then
  echo "Usage: $0 <version>" >&2
  echo "  e.g. $0 2.4.1" >&2
  exit 1
fi

VERSION="$1"

echo "==> Running build + tests..."
npm run build
npm test

echo "==> Bumping all packages to $VERSION..."
npm version "$VERSION" --workspaces --include-workspace-root --no-git-tag-version --allow-same-version

echo "==> Committing version bump..."
git add packages/*/package.json package.json package-lock.json
if git diff --cached --quiet; then
  # A release-prep PR may have landed the lockstep bump already (e.g. v3.0.1);
  # --allow-same-version above makes the bump a no-op, so skip the empty commit.
  echo "==> Versions already at $VERSION (bump pre-staged); skipping bump commit."
else
  git commit -m "chore: release v$VERSION"
fi

echo "==> Tagging..."
git tag "v$VERSION"

echo "==> Publishing to npm..."
npm publish --workspaces --access public

echo "==> Pushing tags..."
git push --follow-tags

echo "==> Done! v$VERSION published."
