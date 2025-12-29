@echo off
setlocal enabledelayedexpansion
set "CONEMU_EXE=C:\laragon\bin\cmder\vendor\conemu-maximus5\ConEmu64.exe"
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

title NaySaaS - Integrated Runner
color 0B

echo ========================================
echo    NaySaaS - Maintenance ^& Startup
echo ========================================
echo.

REM --- PHP DETECTION ---
set "PHP_CMD=php"
where %PHP_CMD% >nul 2>nul
if %errorlevel% neq 0 (
    for /d %%D in ("C:\laragon\bin\php\php-*") do (
        if exist "%%D\php.exe" (
            set "PHP_CMD=%%D\php.exe"
            goto :php_found
        )
    )
    echo [ERROR] PHP not found!
    pause
    exit /b 1
)
:php_found

echo [1/4] Running Backend Maintenance Tasks...
cd /d "%BACKEND_DIR%"
"%PHP_CMD%" artisan optimize:clear
"%PHP_CMD%" artisan config:clear
"%PHP_CMD%" artisan cache:clear
call composer dump-autoload
echo.

echo [2/4] Starting Backend Server...
if exist "%CONEMU_EXE%" (
    echo Launching Laravel in ConEmu Tab...
    start "" "%CONEMU_EXE%" -Title "Laravel Backend (Port 8000)" -Dir "%BACKEND_DIR%" -run cmd /k ""%PHP_CMD%" artisan serve --host=localhost --port=8000"
) else (
    echo Falling back to regular CMD...
    start "Laravel Backend" cmd /k "cd /d %BACKEND_DIR% && "%PHP_CMD%" artisan serve --host=localhost --port=8000"
)
timeout /t 2 /nobreak >nul
echo.

echo [3/4] Starting Frontend Server...
cd /d "%FRONTEND_DIR%"
if exist "%CONEMU_EXE%" (
    echo Launching Vite in ConEmu Tab...
    start "" "%CONEMU_EXE%" -Title "Vite Frontend (Port 3000)" -Dir "%FRONTEND_DIR%" -run cmd /k "npm run dev"
) else (
    echo Falling back to regular CMD...
    start "Vite Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"
)
echo.

echo [4/4] Opening Browser...
echo Waiting for servers to initialize...
timeout /t 8 /nobreak >nul

REM Open the main application
start http://localhost:3000

echo.
echo ========================================
echo    All systems are now running!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo Press any key to exit this window...
echo (Servers will continue running in background)
pause >nul
exit
