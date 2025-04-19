@echo off
echo Removing problematic "hell -Command" file from git repository...

REM Attempt to remove from the index
git update-index --assume-unchanged "hell -Command"
git rm --cached --force "hell -Command"

REM Try to clean up the git references
git gc --prune=now
git fsck --full

echo Done! The problematic file should be removed from git tracking.