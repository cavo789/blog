@echo off

cls

if "%1"=="" goto :help

set APP_NAME=app_python

REM The code below is the hex representation of the APP_NAME here above i.e. "app_python"
REM You can get that value by running "make bash" then 'python -c "print('app_python'.encode().hex())"'
REM Needed by the "make devcontainer" action
set DEV_CODE=6170705f707974686f6e

if "%1"=="bash" goto bash
if "%1"=="build" goto build
if "%1"=="devcontainer" goto devcontainer
if "%1"=="up" goto up
if "%1"=="start" goto start "%2"

call :error "Invalid action."
goto :help

:help
echo Usage: %0 command
echo.
echo Available Commands:
echo.
echo   bash         Enter the Docker Python container
echo   build        Build the Python Docker image (to be done only once)
echo   devcontainer Start VSCode and open the Docker container
echo   up           Create and start the Docker container (to be done once a day if you've turned off your computer)
echo   start        Start a Python script in the Docker container (call it like 'make start main.py')
goto :eof

:bash
echo Entering in our %APP_NAME% Docker Python container... Type exit to quit the session.
docker compose --env-file .docker.env exec -it %APP_NAME% /bin/bash
goto :eof

:build
echo Building our Python Docker image
docker compose --env-file .docker.env build
goto :eof

:devcontainer
echo Start vscode and open the Docker container
code --folder-uri vscode-remote://attached-container+%DEV_CODE%/app
goto :eof

:up
echo Create our container...
docker compose --env-file .docker.env up --detach
goto :eof

:start
if "%2"=="" (
    call :error "Please specify the name of the script to execute, f.i. 'make start main.py'"
    goto :eof
)
docker compose --env-file .docker.env exec -it %APP_NAME% python %2
goto :eof

:error
REM Trim double quotes from the beginning and end of the message
set "ERROR_MESSAGE=%*"
set "ERROR_MESSAGE=%ERROR_MESSAGE:~1,-1%"

echo [31mERROR - %ERROR_MESSAGE%[0m

echo.
goto :eof

:eof
