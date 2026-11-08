import sys
from pathlib import Path
import uvicorn

sys.path.insert(0, str(Path(__file__).resolve().parent))

from src.config.settings import settings

if __name__ == "__main__":
    print(f"Запуск CRM Backend на http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("src.main:app", host=settings.HOST, port=settings.PORT, reload=True)
