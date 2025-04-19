@echo off
echo Git Reference Cleanup Utility
echo ============================
echo.
echo This script will remove the problematic "hell -Command" file from your Git repository.
echo.

echo Step 1: Removing the problematic file from disk...
if exist "hell -Command" (
    del "hell -Command"
    echo File deleted from disk.
) else (
    echo File not found on disk, continuing...
)

echo.
echo Step 2: Removing the file from Git's index...
git rm -f --cached "hell -Command" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Successfully removed from Git index.
) else (
    echo Attempting alternative approach with quotes...
    git rm -f --cached "hell -Command " 2>nul
    
    if %ERRORLEVEL% NEQ 0 (
        echo Standard removal failed, trying more advanced techniques...
        
        echo Creating temporary file...
        echo. > "hell -Command"
        
        echo Adding to Git temporarily...
        git add "hell -Command" 2>nul
        
        echo Now removing properly...
        git rm -f "hell -Command" 2>nul
        
        echo Cleaning up...
        if exist "hell -Command" del "hell -Command"
    )
)

echo.
echo Step 3: Running Git garbage collection to clean up...
git gc --prune=now

echo.
echo Step 4: Verifying Git status...
git status

echo.
echo If you no longer see references to "hell -Command", the cleanup was successful!
echo You should now be able to execute "git add -A" without errors.
echo.
pause
