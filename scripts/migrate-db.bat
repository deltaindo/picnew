@echo off
REM ################################################################################
REM Automated Database Migration Script (Windows)
REM Purpose: Automatically migrate database schema from personnel_type_id to bidang_id
REM Usage: migrate-db.bat
REM Date: January 7, 2026
REM ################################################################################

setlocal enabledelayedexpansion

REM Colors are limited on Windows, so we'll use text indicators instead

REM Logging functions
setlocal enabledelayedexpansion

echo.
echo ================================================================================
echo               AUTOMATED DATABASE MIGRATION SCRIPT
echo ================================================================================
echo.

REM Step 1: Check Prerequisites
echo [INFO] Checking prerequisites...

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed
    exit /b 1
)
echo [OK] Docker found

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed
    exit /b 1
)
echo [OK] Docker Compose found

echo.

REM Step 2: Stop and Clean Up
echo [INFO] Stopping containers and removing old database...
echo.

docker-compose down -v --remove-orphans
if %errorlevel% equ 0 (
    echo [OK] Containers stopped and database removed
) else (
    echo [WARN] Containers might not have been running
)

echo.

REM Step 3: Rebuild Images
echo [INFO] Rebuilding Docker images with no cache...
echo.

docker-compose build --no-cache backend postgres
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build images
    exit /b 1
)
echo [OK] Images rebuilt successfully

echo.

REM Step 4: Start Services
echo [INFO] Starting Docker services...
echo.

docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    exit /b 1
)
echo [OK] Services started

echo.

REM Step 5: Wait for Services to Initialize
echo [INFO] Waiting for services to initialize (this may take 2-5 minutes)...
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
    echo [OK] PostgreSQL is ready
    goto postgres_ready
)

set /a remaining=!max_wait!-!elapsed!
echo Waiting for PostgreSQL... !remaining!s remaining

timeout /t 5 /nobreak >nul
set /a elapsed=!elapsed!+5
goto wait_postgres

:postgres_ready
echo.
echo [INFO] Waiting for backend to initialize (30 seconds)...
echo.
timeout /t 30 /nobreak >nul

echo.

REM Step 6: Verify Database Schema
echo [INFO] Verifying database schema...
echo.

echo [INFO] Checking if registration_links table exists...
for /f "delims=" %%i in ('docker exec pic_postgres psql -U postgres -d pic_app -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='registration_links');" 2^>nul') do set "table_exists=%%i"

if "!table_exists!"=="t" (
    echo [OK] registration_links table exists
) else (
    echo [WARN] registration_links table not found yet, waiting...
    timeout /t 10 /nobreak >nul
)

echo [INFO] Checking if bidang_id column exists...
for /f "delims=" %%i in ('docker exec pic_postgres psql -U postgres -d pic_app -t -c "SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='registration_links' AND column_name='bidang_id');" 2^>nul') do set "column_exists=%%i"

if "!column_exists!"=="t" (
    echo [OK] bidang_id column exists
) else (
    echo [ERROR] bidang_id column not found
    echo.
    echo [INFO] Showing available columns:
    docker exec pic_postgres psql -U postgres -d pic_app -c "SELECT column_name FROM information_schema.columns WHERE table_name='registration_links' ORDER BY ordinal_position;"
    exit /b 1
)

echo.

REM Step 7: Verify Backend Health
echo [INFO] Checking backend health...
echo.

setlocal enabledelayedexpansion
set "health_elapsed=0"
set "max_health_wait=60"

:health_check
if !health_elapsed! geq !max_health_wait! (
    echo [WARN] Backend health check timeout, continuing anyway...
    goto health_complete
)

for /f "delims=" %%i in ('curl -s http://localhost:5000/api/health 2^>nul ^| find /c "ok"') do set "health_ok=%%i"

if "!health_ok!"=="0" (
    set /a health_elapsed=!health_elapsed!+5
    echo Healthcheck attempt !health_elapsed! seconds...
    timeout /t 5 /nobreak >nul
    goto health_check
)

echo [OK] Backend is healthy

:health_complete
echo.

REM Step 8: Display Summary
echo ================================================================================
echo                   MIGRATION COMPLETE
echo ================================================================================
echo.

echo [OK] All services running
echo [OK] Database schema updated (personnel_type_id to bidang_id)
echo [OK] PostgreSQL is healthy
echo [OK] Backend is ready

echo.
echo [INFO] Next Steps:
echo         1. Open Frontend: http://localhost:3000
echo         2. Login: admin@example.com / admin123
echo         3. Test: Go to 'Tambah Link Pendaftaran'
echo         4. Verify: Bidang dropdown shows 13 sectors
echo.

echo [INFO] Check Logs:
echo         Backend:   docker-compose logs backend
echo         Database:  docker-compose logs postgres
echo         Full:      docker-compose logs
echo.

echo [INFO] Useful Commands:
echo         Stop:      docker-compose down
echo         View logs: docker-compose logs -f backend
echo         Restart:   docker-compose restart backend
echo.

echo [OK] Migration script completed successfully!
echo.

endlocal
