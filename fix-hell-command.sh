#!/bin/bash

echo "Removing problematic 'hell -Command' file from Git..."

# Step 1: Create empty file temporarily to make Git happy
echo "" > "hell -Command"

# Step 2: Force git removal of the file
git add "hell -Command"
git rm -f "hell -Command"

# Step 3: Run git garbage collection to clean up
git gc --prune=now

echo ""
echo "File should now be removed from Git tracking."
echo "You can now try running: git add -A -- ."
echo ""
echo "If you get errors, try running these commands:"
echo "git update-index --force-remove \"hell -Command\""
echo "git update-index --force-remove \"hell -Command \""
echo ""
echo "After cleaning up, remove all the temporary files:"
echo "rm -f hell* cleanup-git-refs.bat fix-git-error.bat git-error-fix.md git-fix-guide.md git-fix-hell-command.bat remove-hell-command.bat"
