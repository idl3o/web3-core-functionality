@echo off
echo Git Error Fix Utility
echo =====================
echo.
echo Attempting to fix "hell -Command" Git error...

echo.
echo Step 1: Removing problematic reference from Git's index
git rm -f --cached "hell -Command" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo First attempt failed, trying with escaped quotes...
    git rm -f --cached "hell -Command " 2>nul
)

echo.
echo Step 2: Running Git garbage collection to clean up
git gc --prune=now

echo.
echo Step 3: Verifying Git status
git status

echo.
echo If you still see errors, try these additional commands manually:
echo.
echo   git update-index --remove "hell -Command"
echo   git update-index --remove "hell -Command "
echo.
echo After fixing, try your git add command again with:
echo   git add -A -- .
echo.
pause
