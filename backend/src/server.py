import sys
from pathlib import Path
import uvicorn

# Добавляем родительскую директорию в sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from src.config.settings import settings

def main():
    print(f"Запуск CRM Backend на http://{settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "src.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )

if __name__ == "__main__":
    main()
