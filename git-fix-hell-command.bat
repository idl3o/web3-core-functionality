@echo off
echo Git Error Fix Utility
echo =====================
echo.
echo This script will fix the "hell -Command" Git issue.

echo.
echo Step 1: Removing problematic file from Git index...
git rm --cached "hell -Command" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo First attempt failed, trying alternative approach...
    git rm --force --cached -- "hell -Command " 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Both standard removal approaches failed.
        echo Attempting manual Git index cleanup...
        
        echo Creating empty file temporarily...
        echo. > "hell -Command"
        
        echo Adding to Git (to update index)...
        git add "hell -Command" 2>nul
        
        echo Now removing properly...
        git rm -f "hell -Command" 2>nul
        
        echo Cleaning up...
        if exist "hell -Command" del "hell -Command"
    )
)

echo.
echo Step 2: Running Git garbage collection to clean up...
git gc --prune=now

echo.
echo Step 3: Verifying Git status...
git status

echo.
echo If you no longer see errors about "hell -Command" when running "git add", the issue is fixed!
echo If you still see errors, try the manual instructions in git-fix-guide.md
echo.
pause
