@echo off
chcp 65001 >nul 2>&1
title TerraceFeri - Yonetim Sistemi

echo.
echo  ================================================
echo   TERRACE FERI - REZIDANS YONETIM SISTEMI
echo  ================================================
echo.

:: Bat dosyasinin oldugu klasore git
cd /d "%~dp0"

:: apps\tmm klasorune gec
if not exist "apps\tmm" (
    echo  [HATA] apps\tmm klasoru bulunamadi!
    echo  Bat dosyasinin TerraceFeri klasorunde oldugunu kontrol edin.
    echo.
    pause
    exit /b 1
)

cd apps\tmm

:: Node.js yuklu mu?
where node >nul 2>&1
if errorlevel 1 (
    echo  [HATA] Node.js bulunamadi!
    echo  Lutfen Node.js yukleyin: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: node_modules var mi?
if not exist "node_modules" (
    echo  [BILGI] node_modules bulunamadi. npm install calistiriliyor...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [HATA] npm install basarisiz oldu!
        echo.
        pause
        exit /b 1
    )
    echo.
)

:: Prisma client'lari olustur (her zaman - kalici cozum)
echo  [BILGI] Prisma client'lari olusturuluyor...
echo.

call npx prisma generate --schema=modules/core/database/schema.prisma
if errorlevel 1 (
    echo  [UYARI] Core Prisma client olusturulamadi!
)

call npx prisma generate --schema=modules/area/database/schema.prisma
if errorlevel 1 (
    echo  [UYARI] Area Prisma client olusturulamadi!
)

call npx prisma generate --schema=modules/apartment/database/schema.prisma
if errorlevel 1 (
    echo  [UYARI] Apartment Prisma client olusturulamadi!
)

call npx prisma generate --schema=modules/company/database/schema.prisma
if errorlevel 1 (
    echo  [UYARI] Company Prisma client olusturulamadi!
)

call npx prisma generate --schema=modules/equipment/database/schema.prisma
if errorlevel 1 (
    echo  [UYARI] Equipment Prisma client olusturulamadi!
)

call npx prisma generate --schema=modules/fault/database/schema.prisma
if errorlevel 1 (
    echo  [UYARI] Fault Prisma client olusturulamadi!
)

call npx prisma generate --schema=modules/personnel/database/schema.prisma
if errorlevel 1 (
    echo  [UYARI] Personnel Prisma client olusturulamadi!
)

echo.
echo  [OK] Tum Prisma client'lari hazir!
echo.

:: Port 3005 kullanimda mi?
netstat -ano | findstr ":3005 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo  [UYARI] Port 3005 zaten kullanimda!
    echo  Onceki sunucuyu kapatip tekrar deneyin.
    echo  Veya farkli port ile baslatmak icin bir tusa basin...
    echo.
    pause
)

echo  ================================================
echo   Sunucu baslatiliyor...
echo   Tarayicinizdan: http://localhost:3005
echo   Durdurmak icin: CTRL + C
echo  ================================================
echo.

call npx next dev -p 3005

echo.
echo  ================================================
echo   Sunucu durduruldu.
echo  ================================================
echo.
pause
