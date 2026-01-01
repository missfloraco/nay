@echo off
echo ==========================================
echo       SSH Key Generator for Deployment
echo ==========================================
echo.
echo This will generate a new SSH key specifically for your GitHub Actions deployment.
echo.
REM Define the path for the keys
set KEY_PATH=%USERPROFILE%\.ssh\github_deploy_key

REM Generate the key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f "%KEY_PATH%" -N ""

echo.
echo ==========================================
echo               SUCCESS!
echo ==========================================
echo.
echo 1. Your PUBLIC KEY is here:
echo    %KEY_PATH%.pub
echo    (Copy its content to Hostinger SSH Keys)
echo.
echo 2. Your PRIVATE KEY is here:
echo    %KEY_PATH%
echo    (Copy its content to GitHub Secrets as SSH_PRIVATE_KEY)
echo.
echo ==========================================
pause
