@echo off
REM Standard Windows SSH config location
set "SSH_CONFIG_DIR=%USERPROFILE%\.ssh"
set "CONFIG_FILE=%SSH_CONFIG_DIR%\config"

REM Your actual key location
set "ACTUAL_KEY_PATH=C:/laragon/www/.ssh/github_deploy_key"

if not exist "%SSH_CONFIG_DIR%" mkdir "%SSH_CONFIG_DIR%"

echo Host github.com > "%CONFIG_FILE%"
echo     HostName github.com >> "%CONFIG_FILE%"
echo     User git >> "%CONFIG_FILE%"
echo     IdentityFile %ACTUAL_KEY_PATH% >> "%CONFIG_FILE%"
echo     IdentitiesOnly yes >> "%CONFIG_FILE%"

echo ==========================================
echo        SSH Config Updated to Actual Path!
echo ==========================================
echo Path used: %ACTUAL_KEY_PATH%
echo.
echo Now testing connection with GitHub...
echo.
ssh -T git@github.com
pause
