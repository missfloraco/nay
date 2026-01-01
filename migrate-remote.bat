@echo off
echo Connecting to Hostinger to run database migrations...

:: Runs 'php artisan migrate --force' on the remote server
ssh -p 65002 -o StrictHostKeyChecking=no u135934022@92.113.19.147 "cd domains/missflora.uk/backend && /opt/alt/php83/usr/bin/php artisan migrate --force && echo '✅ Database Migrated Successfully!'"

echo.
echo Done!
pause
