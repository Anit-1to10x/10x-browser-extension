@echo off
REM Run all browser extension tests sequentially
REM Windows batch script for running test suite

setlocal enabledelayedexpansion

echo ============================================================
echo Browser Extension Test Suite
echo ============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if ws package is installed
if not exist "node_modules\ws" (
    echo [INFO] Installing ws package...
    call npm install ws
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install ws package
        exit /b 1
    )
    echo.
)

REM Initialize counters
set TOTAL_TESTS=0
set PASSED_TESTS=0
set FAILED_TESTS=0

REM Array of test files
set "TESTS[0]=test-connection.js"
set "TESTS[1]=test-linkedin.js"
set "TESTS[2]=test-instagram.js"
set "TESTS[3]=test-twitter.js"
set "TESTS[4]=test-google.js"

REM Get script directory
set SCRIPT_DIR=%~dp0

echo Starting test suite...
echo.

REM Run each test
for /L %%i in (0,1,4) do (
    set /a TOTAL_TESTS+=1

    echo ------------------------------------------------------------
    echo Running: !TESTS[%%i]!
    echo ------------------------------------------------------------

    node "%SCRIPT_DIR%!TESTS[%%i]!"

    if !ERRORLEVEL! EQU 0 (
        set /a PASSED_TESTS+=1
        echo [PASS] !TESTS[%%i]! completed successfully
    ) else (
        set /a FAILED_TESTS+=1
        echo [FAIL] !TESTS[%%i]! failed
    )

    echo.

    REM Add delay between tests
    timeout /t 2 /nobreak >nul
)

echo ============================================================
echo Test Suite Summary
echo ============================================================
echo Total tests:  %TOTAL_TESTS%
echo Passed:       %PASSED_TESTS%
echo Failed:       %FAILED_TESTS%
echo ============================================================
echo.

if %FAILED_TESTS% GTR 0 (
    echo [RESULT] Some tests FAILED
    exit /b 1
) else (
    echo [RESULT] All tests PASSED
    exit /b 0
)
