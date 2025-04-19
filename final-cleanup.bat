@echo off
echo Git Cleanup Utility
echo ==================
echo.
echo Removing all temporary Git fix scripts and files...

echo Removing hell -Command file...
if exist "hell -Command" del "hell -Command"

echo Removing cleanup scripts...
if exist cleanup-git-refs.bat del cleanup-git-refs.bat
if exist fix-git-error.bat del fix-git-error.bat
if exist git-error-fix.md del git-error-fix.md
if exist git-fix-guide.md del git-fix-guide.md
if exist git-fix-hell-command.bat del git-fix-hell-command.bat
if exist remove-hell-command.bat del remove-hell-command.bat
if exist fix-hell-command.sh del fix-hell-command.sh

echo.
echo Now checking Git status:
git status

echo.
echo Cleanup complete! You may now proceed with:
echo git add -A -- .
echo git commit -m "Your commit message"
echo.

pause
