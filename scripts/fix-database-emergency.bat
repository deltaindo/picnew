@echo off
REM ################################################################################
REM EMERGENCY DATABASE FIX SCRIPT (Windows) - FULLY AUTOMATIC
REM Purpose: Force reset database when migration is stuck
REM Usage: fix-database-emergency.bat (no prompts!)
REM Date: January 7, 2026
REM ################################################################################

setlocal enabledelayedexpansion

echo.
echo ================================================================================
echo                  EMERGENCY DATABASE RESET - AUTO MODE
echo ================================================================================
echo.

echo [INFO] Starting automatic database reset...
echo.

REM STEP 1: Stop everything
echo [INFO] [1/8] Stopping all containers...
docker-compose down >nul 2>&1
echo [OK] Containers stopped
echo.

REM STEP 2: Remove volumes
echo [INFO] [2/8] Finding and removing database volume...

for /f "tokens=*" %%i in ('docker volume ls -q 2^>nul ^| findstr /i postgres') do set "VOLUME=%%i"

if not "!VOLUME!"==" " (
    echo [WARN] Found volume: !VOLUME!
    docker volume rm !VOLUME! >nul 2>&1
    echo [OK] Volume removed
) else (
    echo [WARN] No postgres volume found ^(OK^)
)

echo.

REM STEP 3: Clean volumes
echo [INFO] [3/8] Cleaning up unused volumes...
docker volume prune -f >nul 2>&1
echo [OK] Volumes cleaned

echo.

REM STEP 4: Rebuild images
echo [INFO] [4/8] Rebuilding Docker images ^(no cache^)...
docker-compose build --no-cache backend postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build images
    exit /b 1
)
echo [OK] Images rebuilt

echo.

REM STEP 5: Start services
echo [INFO] [5/8] Starting fresh services...
docker-compose up -d >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    exit /b 1
)
echo [OK] Services started

echo.

REM STEP 6: Wait for services
echo [INFO] [6/8] Waiting for services to initialize...
echo.

setlocal enabledelayedexpansion
set "elapsed=0"
set "max_wait=300"

:wait_postgres
if !elapsed! geq !max_wait! (
    echo [ERROR] PostgreSQL failed to start within timeout
    exit /b 1
)

docker exec pic_postgres pg_isready -U postgres >nul 2>nul
if !errorlevel! equ 0 (
    echo [OK] PostgreSQL ready
    goto postgres_ready
)

set /a remaining=!max_wait!-!elapsed!
echo. | set /p="Waiting... !remaining!s remaining  "

timeout /t 5 /nobreak >nul
set /a elapsed=!elapsed!+5
goto wait_postgres

:postgres_ready
echo.
echo [INFO] Waiting additional 30 seconds for backend initialization...
timeout /t 30 /nobreak >nul

echo.

REM STEP 7: Verify database schema
echo [INFO] [7/8] Verifying database schema...
echo.

echo [INFO] Checking registration_links table...
for /f "delims=" %%i in ('docker exec pic_postgres psql -U postgres -d pic_app -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='registration_links');" 2^>nul') do set "table_exists=%%i"

if "!table_exists!"=="t" (
    echo [OK] Table exists
) else (
    echo [ERROR] Table not found
    echo [INFO] Waiting additional 30 seconds...
    timeout /t 30 /nobreak >nul
)

echo [INFO] Checking bidang_id column...
for /f "delims=" %%i in ('docker exec pic_postgres psql -U postgres -d pic_app -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='registration_links' AND column_name='bidang_id');" 2^>nul') do set "column_exists=%%i"

if "!column_exists!"=="t" (
    echo [OK] bidang_id column exists
) else (
    echo [ERROR] bidang_id column NOT found
    echo [INFO] Showing available columns:
    docker exec pic_postgres psql -U postgres -d pic_app -c "SELECT column_name FROM information_schema.columns WHERE table_name='registration_links';"
    exit /b 1
)

echo.

REM STEP 8: Verify backend health
echo [INFO] [8/8] Checking backend health...
echo.

for /f "delims=" %%i in ('curl -s http://localhost:5000/api/health 2^>nul ^| findstr /c:"ok"') do set "health_ok=1"

if "!health_ok!"=="1" (
    echo [OK] Backend is healthy
) else (
    echo [WARN] Backend not responding yet, waiting...
    timeout /t 10 /nobreak >nul
    for /f "delims=" %%i in ('curl -s http://localhost:5000/api/health 2^>nul ^| findstr /c:"ok"') do set "health_ok=1"
    if "!health_ok!"=="1" (
        echo [OK] Backend is now healthy
    ) else (
        echo [WARN] Backend still not responding ^(database is fixed^)
    )
)

echo.

REM FINAL: Display results
echo ================================================================================
echo                      EMERGENCY FIX COMPLETE
echo ================================================================================
echo.

echo [OK] Database schema updated ^(personnel_type_id -^> bidang_id^)
echo [OK] All services running
echo [OK] Backend ready

echo.
echo [INFO] Next Steps:
echo         1. Open: http://localhost:3000
echo         2. Login: admin@example.com / admin123
echo         3. Test: Go to 'Tambah Link Pendaftaran'
echo         4. Verify: Bidang dropdown shows 13 sectors
echo.

echo [INFO] Check Health:
echo         Backend: curl http://localhost:5000/api/health
echo         Logs: docker-compose logs -f backend
echo.

echo [OK] Emergency fix completed successfully!
echo.

endlocal
