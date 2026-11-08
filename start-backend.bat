@echo off
chcp 65001 > nul
echo ====================================================
echo  Запуск CRM Backend (Python / FastAPI)
echo  Локальный запуск БЕЗ Docker
echo ====================================================
cd /d "%~dp0backend"
python run.py
pause