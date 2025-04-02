@echo off
echo Running build process...
cd C:\Users\Sam\Documents\GitHub\gh-pages
run-script dev
run-script build
run-script deploy
call npm run build
if %errorlevel% neq 0 (
  echo Build failed with error code %errorlevel%
  pause
  exit /b %errorlevel%
)
echo Build complete! Files should be in the dist directory.
echo Checking if dist directory exists:
if exist dist (
  echo dist directory found! Build was successful.
  dir dist
) else (
  echo WARNING: dist directory not found. Build may have failed.
)
pause
