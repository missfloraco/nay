@echo off
chcp 65001 >nul
echo ===================================================
echo   Deploying Project to Master (Hostinger Live)
echo ===================================================

REM 1. Ensure we are on Master
git checkout master
if %errorlevel% neq 0 (
    echo Error: Could not switch to master. Please check your git status.
    pause
    exit /b
)

REM 2. Pull latest changes
echo Pulling latest changes...
git pull origin master

REM 3. Add all changes
echo Adding files...
git add .

REM 4. Commit
set /p commit_msg="Enter commit message (Press Enter for 'Update'): "
if "%commit_msg%"=="" set commit_msg="Update"
git commit -m "%commit_msg%"

REM 5. Push
echo Pushing to Master...
git push origin master

echo.
echo ===================================================
echo   Deployment Complete!
echo ===================================================
pause
