@echo off
setlocal

if "%1"=="" (
  echo Please provide a script name from package.json
  echo Available scripts:
  call npm run
  goto :end
)

echo Running script: %1
call npm run %1
if %errorlevel% neq 0 (
  echo Script failed with error code %errorlevel%
  goto :end
)
echo Script '%1' completed successfully.

:end
pause
endlocal
