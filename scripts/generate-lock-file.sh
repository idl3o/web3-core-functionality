#!/bin/bash
# Script to generate and commit package-lock.json

# Check if we're in the git repository
if [ ! -d ".git" ]; then
  echo "Error: This script must be run from the root of the git repository."
  exit 1
fi

echo "Generating package-lock.json file..."
npm install --package-lock-only

# Check if file was generated
if [ ! -f "package-lock.json" ]; then
  echo "Error: Failed to generate package-lock.json"
  exit 1
fi

echo "package-lock.json successfully generated!"
echo ""
echo "To commit this file to your repository, run:"
echo "  git add package-lock.json"
echo "  git commit -m \"Add package-lock.json for dependency management\""
echo "  git push origin main"
echo ""
echo "This will resolve the 'Dependencies lock file not found' error in GitHub Actions."
