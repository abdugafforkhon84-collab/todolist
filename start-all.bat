@echo off
chcp 65001 > nul
echo ====================================================
echo  Запуск CRM Системы (Backend + Frontend)
echo  Локальный запуск БЕЗ Docker
echo ====================================================
start "CRM Backend (FastAPI)" cmd /k "%~dp0start-backend.bat"
timeout /t 2 /nobreak > nul
start "CRM Frontend (React PWA)" cmd /k "%~dp0start-frontend.bat"
echo.
echo Сервисы запущены:
echo Backend:  http://127.0.0.1:8000 (Документация Swagger: http://127.0.0.1:8000/docs)
echo Frontend: http://localhost:5173
echo.
pause

