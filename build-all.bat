@echo off
echo ========================================================
echo  Event Spacing - Building All Projects (Customer, Vendor, Admin, Backend)
echo ========================================================
echo.

echo [1/4] Building Customer UI...
cd Event_Spacing_customer_ui
call npm run build
if %errorlevel% neq 0 (
    echo Error building Customer UI
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/4] Building Vendor UI...
cd Event_Spacing_vendor_ui
call npm run build
if %errorlevel% neq 0 (
    echo Error building Vendor UI
    exit /b %errorlevel%
)
cd ..

echo.
echo [3/4] Building Admin UI...
cd Event_Spacing_admin_ui
call npm run build
if %errorlevel% neq 0 (
    echo Error building Admin UI
    exit /b %errorlevel%
)
cd ..

echo.
echo [4/4] Building Backend API...
cd Event_Spacing_backend
call npm run build
if %errorlevel% neq 0 (
    echo Error building Backend API
    exit /b %errorlevel%
)
cd ..

echo.
echo ========================================================
echo  All 4 builds completed successfully!
echo ========================================================
pause
