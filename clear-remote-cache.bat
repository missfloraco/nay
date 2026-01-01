@echo off
echo Connecting to Hostinger to clear cache...

:: Simplified command to avoid syntax errors with special characters
ssh -p 65002 -o StrictHostKeyChecking=no u135934022@92.113.19.147 "cd domains/missflora.uk/backend && /opt/alt/php83/usr/bin/php artisan optimize:clear && echo '✅ Cache Cleared Successfully!'"

echo.
echo Done!
pause
