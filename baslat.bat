@echo off
chcp 65001 >nul 2>&1
title TerraceFeri - Rezidans Yonetim Sistemi

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

:: Node.js kontrolu
where node >nul 2>&1
if errorlevel 1 (
    echo  [HATA] Node.js bulunamadi!
    echo  Lutfen Node.js yukleyin: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: node_modules kontrolu
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

:: Eski takili kalan 3005 portu varsa otomatik temizle
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3005 " ^| findstr "LISTENING"') do (
    echo  [BILGI] Port 3005 uzerindeki eski oturum kapatiliyor (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

:: 9 Modullu Birlesik Prisma Client'lari Olustur
echo  [BILGI] 9 Modullu Prisma Client'lari hazirlaniyor...
echo.
call npx prisma generate --schema=prisma/schema.prisma
if errorlevel 1 (
    echo.
    echo  [UYARI] Prisma client olusturulurken bir sorun yasandi.
    echo.
) else (
    echo.
    echo  [OK] Tum 9 modül Prisma Client'i basariyla hazirlandi!
    echo.
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
