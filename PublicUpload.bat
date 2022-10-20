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
set files=%files% "%1"
shift
if not "%~1"=="" goto loop

set files=%files:~1%

node cli.js --user=public --files=%files%

IF %ERRORLEVEL% == 2 ( 
   echo "Database error"
   pause
)
IF %ERRORLEVEL% == 3 ( 
   echo "Missing files to upload"
   pause
)

IF %ERRORLEVEL% NEQ 0 ( 
   echo There were %ERRORLEVEL% files that could not be uploaded!
   pause
)

cd ..