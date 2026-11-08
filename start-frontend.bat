@echo off
chcp 65001 > nul
echo ====================================================
echo  Запуск CRM Frontend (React PWA + Vite)
echo  Локальный запуск БЕЗ Docker
echo ====================================================
cd /d "%~dp0frontend"
call npm.cmd run dev
pause

