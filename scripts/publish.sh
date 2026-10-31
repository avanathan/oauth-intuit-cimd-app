#!/usr/bin/env bash
# Builds the site and pushes dist/ to the gh-pages branch of origin (GitHub Pages must be enabled for the repo).
# Run from an up-to-date master. Set PAGES_ORIGIN / PAGES_BASE if the site is not served at the defaults.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp -R dist/. "$tmp"
touch "$tmp/.nojekyll"
git -C "$tmp" init -q -b gh-pages
git -C "$tmp" add -A
git -C "$tmp" commit -q -m "Publish $(git rev-parse --short HEAD)"
git -C "$tmp" push -f "$(git remote get-url origin)" gh-pages
