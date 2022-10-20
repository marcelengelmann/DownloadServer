@echo off

cd %~dp0
cd Server\backend

set files=

if "%~1"=="" (
   echo "No files found in request!"
   pause
   exit
)

:loop
set files=%files% %1
shift
if not "%~1"=="" goto loop

set files=%files:~1%

echo node cli.js --user=private --files=%files%

node cli.js --user=private --files=%files%

IF %ERRORLEVEL% == 1 ( 
   echo "Authentication failed"
   pause
)
IF %ERRORLEVEL% == 2 ( 
   echo "Database error"
   pause
)
IF %ERRORLEVEL% == 3 ( 
   echo "Missing files to upload"
   pause
)

IF %ERRORLEVEL% GEQ 4 (
   set /a "invalidFiles=%ERRORLEVEL%-3"
   echo There were %invalidFiles% files that could not be uploaded!
   pause
)

cd ..