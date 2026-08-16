@echo off
echo ═══════════════════════════════════════════════════
echo   GLASSMORPHISM GERI AL - Eski tasarima don
echo ═══════════════════════════════════════════════════
echo.

set BASE=c:\Users\PC\Desktop\TerraceFeri\apps\tmm

echo [1/7] globals.css geri aliniyor...
copy /Y "%BASE%\src\app\globals.css.backup" "%BASE%\src\app\globals.css"

echo [2/7] layout.tsx (root) geri aliniyor...
copy /Y "%BASE%\src\app\layout.tsx.backup" "%BASE%\src\app\layout.tsx"

echo [3/7] Dashboard layout geri aliniyor...
copy /Y "%BASE%\src\app\(dashboard)\layout.tsx.backup" "%BASE%\src\app\(dashboard)\layout.tsx"

echo [4/7] Sidebar geri aliniyor...
copy /Y "%BASE%\src\components\layout\Sidebar.tsx.backup" "%BASE%\src\components\layout\Sidebar.tsx"

echo [5/7] Header geri aliniyor...
copy /Y "%BASE%\src\components\layout\Header.tsx.backup" "%BASE%\src\components\layout\Header.tsx"

echo [6/7] Admin Dashboard geri aliniyor...
copy /Y "%BASE%\src\app\(dashboard)\admin\page.tsx.backup" "%BASE%\src\app\(dashboard)\admin\page.tsx"

echo [7/7] Personnel ve Settings geri aliniyor...
copy /Y "%BASE%\src\app\(dashboard)\admin\personnel\page.tsx.backup" "%BASE%\src\app\(dashboard)\admin\personnel\page.tsx"
copy /Y "%BASE%\src\app\(dashboard)\admin\settings\page.tsx.backup" "%BASE%\src\app\(dashboard)\admin\settings\page.tsx"

echo.
echo ═══════════════════════════════════════════════════
echo   TAMAMLANDI! Eski tasarim geri yuklendi.
echo   Dev server'i yeniden baslatin.
echo ═══════════════════════════════════════════════════
pause
