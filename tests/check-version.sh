#!/usr/bin/env bash
# Checks that the version is the same in package.json, index.html and
# CHANGELOG.md, and that no part of it has two digits (project rule).
set -u
cd "$(dirname "$0")/.."
fail=0
pkg=$(sed -n 's/^[[:space:]]*"version":[[:space:]]*"\([^"]*\)".*/\1/p' package.json | head -1)
html=$(sed -n 's/.*data-fassung="\([^"]*\)".*/\1/p' index.html | head -1)
echo "package.json: ${pkg:-?}   index.html: ${html:-?}"
if [ -z "$pkg" ] || [ "$pkg" != "$html" ]; then
  echo "FAIL - version in package.json and data-fassung in index.html differ"; fail=1
fi
if ! grep -qF "## [$pkg]" CHANGELOG.md || ! grep -q "^## \[$pkg\]" CHANGELOG.md; then
  echo "FAIL - CHANGELOG.md has no line starting with '## [$pkg]'"; fail=1
fi
if ! echo "$pkg" | grep -Eq '^[0-9]\.[0-9]\.[0-9]$'; then
  echo "FAIL - version '$pkg' must be x.y.z with single digits (after x.9.z comes the next major version)"; fail=1
fi
[ $fail -eq 0 ] && echo "ok - version $pkg is consistent"
exit $fail
