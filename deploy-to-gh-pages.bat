@echo off
echo ===================================================
echo GitHub Pages Deployment Script
echo ===================================================
echo.
echo This script will update the gh-pages branch with your latest tech stack
echo.

echo Step 1: Saving current branch name...
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%a
echo Current branch: %current_branch%
echo.

echo Step 2: Building the site...
rem Add your build command here if needed, for example:
rem npm run build
echo.

echo Step 3: Switching to gh-pages branch...
git checkout gh-pages
echo.

echo Step 4: Copying latest files from main branch...
git checkout %current_branch% -- index.html
git checkout %current_branch% -- streaming.html
git checkout %current_branch% -- 404.html
git checkout %current_branch% -- assets/
git checkout %current_branch% -- contracts/
git checkout %current_branch% -- docs/
git checkout %current_branch% -- StreamAccessContract.sol
git checkout %current_branch% -- Streaming.sol
git checkout %current_branch% -- StreamPayment.sol
git checkout %current_branch% -- StreamToken.sol
echo.

echo Step 5: Staging the changes...
git add .
echo.

echo Step 6: Committing the changes...
git commit -m "Update GitHub Pages with latest tech stack from branch %current_branch%"
echo.

echo Step 7: Pushing to GitHub...
git push origin gh-pages
echo.

echo Step 8: Switching back to original branch...
git checkout %current_branch%
echo.

echo ===================================================
echo Deployment complete!
echo Visit https://idl3o.github.io/gh-pages/ to see your updated site
echo ===================================================