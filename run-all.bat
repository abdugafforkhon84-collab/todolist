@echo off
chcp 65001 > nul
echo ====================================================
echo  Запуск CRM Backend и Frontend (React Vite) 
echo  Автоматический перезапуск при изменениях кода
echo ====================================================

rem Запуск backend в отдельном окне
start "Backend" cmd /c "C:\\Users\\r7473\\todolist\\start-backend.bat"

rem Запуск frontend в отдельном окне
start "Frontend" cmd /c "C:\\Users\\r7473\\todolist\\start-frontend.bat"

pause

