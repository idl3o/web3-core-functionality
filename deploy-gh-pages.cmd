@echo off
echo Building static version for GitHub Pages...

:: Create static build directory
set BUILD_DIR=.\build
if not exist %BUILD_DIR% mkdir %BUILD_DIR%

:: Create assets directory structure
if not exist %BUILD_DIR%\assets mkdir %BUILD_DIR%\assets
if not exist %BUILD_DIR%\assets\css mkdir %BUILD_DIR%\assets\css
if not exist %BUILD_DIR%\assets\js mkdir %BUILD_DIR%\assets\js
if not exist %BUILD_DIR%\assets\images mkdir %BUILD_DIR%\assets\images

:: Copy HTML files
echo Copying HTML files...
copy /Y index.html %BUILD_DIR%\
if exist streaming.html copy /Y streaming.html %BUILD_DIR%\
if exist 404.html copy /Y 404.html %BUILD_DIR%\

:: Copy assets
echo Copying assets...
if exist assets\css\*.css copy /Y assets\css\*.css %BUILD_DIR%\assets\css\
if exist assets\js\*.js copy /Y assets\js\*.js %BUILD_DIR%\assets\js\
if exist main.css copy /Y main.css %BUILD_DIR%\assets\css\

:: Copy smart contract files
echo Copying smart contracts...
if exist Streaming.sol copy /Y Streaming.sol %BUILD_DIR%\
if exist StreamToken.sol copy /Y StreamToken.sol %BUILD_DIR%\
if exist StreamPayment.sol copy /Y StreamPayment.sol %BUILD_DIR%\
if exist StreamAccessContract.sol copy /Y StreamAccessContract.sol %BUILD_DIR%\

:: Create .nojekyll file to prevent Jekyll processing
echo Creating .nojekyll file...
type nul > %BUILD_DIR%\.nojekyll

echo Static build complete! Files are in the ./build directory.
echo.
echo To deploy to GitHub Pages:
echo 1. Create a gh-pages branch
echo 2. Copy the contents of the build directory to the gh-pages branch
echo 3. Push the gh-pages branch to GitHub
echo.
echo Or with npm:
echo npm install -g gh-pages ^&^& gh-pages -d build
echo.

echo Would you like to deploy to GitHub Pages now? (Y/N)
set /p DEPLOY_CHOICE=

if /i "%DEPLOY_CHOICE%"=="Y" (
  where npm >nul 2>nul
  if %ERRORLEVEL% NEQ 0 (
    echo Error: npm not found. Please install Node.js and npm.
    exit /b 1
  )

  echo Installing gh-pages package...
  npm install -g gh-pages

  echo Deploying to GitHub Pages...
  gh-pages -d build

  if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed.
    exit /b 1
  ) else (
    echo Deployment successful! Your site should be available at:
    echo https://idl3o.github.io/web3-core-functionality/
  )
) else (
  echo Deployment skipped. You can deploy manually later.
)

exit /b 0
