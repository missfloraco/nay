@echo off
set "SSH_DIR=%USERPROFILE%\.ssh"
set "CONFIG_FILE=%SSH_DIR%\config"

if not exist "%SSH_DIR%" mkdir "%SSH_DIR%"

echo Host github.com > "%CONFIG_FILE%"
echo     HostName github.com >> "%CONFIG_FILE%"
echo     User git >> "%CONFIG_FILE%"
echo     IdentityFile ~/.ssh/github_deploy_key >> "%CONFIG_FILE%"
echo     IdentitiesOnly yes >> "%CONFIG_FILE%"

echo ==========================================
echo        SSH Config Fixed Successfully!
echo ==========================================
echo.
echo Now testing connection with GitHub...
echo.
ssh -T git@github.com
pause
