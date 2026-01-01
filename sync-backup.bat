@echo off
chcp 65001 >nul
echo ===================================================
echo   Syncing Master to Backup Branch (Safe Copy)
echo ===================================================

REM 1. Ensure Master is up to date
echo Checking Master...
git checkout master
git pull origin master

REM 2. Switch to Backup Branch (Create if missing)
echo Switching to backup-safe branch...
git checkout backup-safe 2>nul
if %errorlevel% neq 0 (
    echo Branch 'backup-safe' does not exist. Creating it now...
    git checkout -b backup-safe
)

REM 3. Merge Master into Backup
echo Merging Master changes...
git merge master

REM 4. Push Backup
echo Pushing Backup to GitHub...
git push origin backup-safe

REM 5. Return to Master
echo Returning to Master branch...
git checkout master

echo.
echo ===================================================
echo   Backup Sync Complete!
echo ===================================================
pause
