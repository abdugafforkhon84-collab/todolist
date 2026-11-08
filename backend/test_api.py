import sys
from pathlib import Path
from fastapi.testclient import TestClient

root_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(root_dir))

from src.main import app

client = TestClient(app)

def test_full_workflow():
    print("--- 1. Проверка /api/health ---")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health check OK:", res.json())

    print("\n--- 2. Вход в систему (Авторизация) ---")
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token_data = login_res.json()
    token = token_data["access_token"]
    print(f"Token received successfully! User: {token_data['user']['full_name']}")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Проверка профиля текущего пользователя ---")
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200, f"Get me failed: {me_res.text}"
    print("Current user:", me_res.json())

    print("\n--- 4. Получение статистики ---")
    stats_res = client.get("/api/records/stats", headers=headers)
    assert stats_res.status_code == 200, f"Get stats failed: {stats_res.text}"
    stats = stats_res.json()
    print("Статистика:", stats)

    print("\n--- 5. Получение записей по вкладкам ---")
    for tab in ["Активно", "Долг", "Архив"]:
        tab_res = client.get(f"/api/records?tab={tab}", headers=headers)
        assert tab_res.status_code == 200
        items = tab_res.json()
        print(f"Вкладка '{tab}': {len(items)} записей")

    print("\n--- 6. Создание новой записи с предоплатой (ожидается статус 'Долг') ---")
    new_record_payload = {
        "client_name": "Тестовый Заказчик",
        "phone_number": "+7 (999) 000-11-22",
        "total_amount": 100000.0,
        "paid_amount": 40000.0,
        "period": "Декабрь 2026",
        "task_description": "Разработка мобильного интерфейса и интеграция API",
        "is_completed": False
    }
    create_res = client.post("/api/records", json=new_record_payload, headers=headers)
    assert create_res.status_code == 201, f"Create record failed: {create_res.text}"
    created_item = create_res.json()
    print(f"Создана запись #{created_item['id']} с остатком долга {created_item['remaining_amount']} тенге. Статус: {created_item['status']}")
    assert created_item["status"] == "Долг", f"Expected 'Долг', got {created_item['status']}"
    assert created_item["remaining_amount"] == 60000.0

    print("\n--- 7. Внесение частичной доплаты 20 000 тенге (остаток должен быть 40 000 тенге, статус 'Долг') ---")
    pay1_res = client.post(f"/api/records/{created_item['id']}/payment", json={"amount": 20000.0}, headers=headers)
    assert pay1_res.status_code == 200
    p1_data = pay1_res.json()
    print(f"После частичной оплаты: оплачено={p1_data['paid_amount']}, остаток={p1_data['remaining_amount']}, статус={p1_data['status']}")
    assert p1_data["status"] == "Долг"
    assert p1_data["remaining_amount"] == 40000.0

    print("\n--- 8. Внесение оставшейся доплаты 40 000 тенге (долг закрыт -> автоматический перенос в 'Архив') ---")
    pay2_res = client.post(f"/api/records/{created_item['id']}/payment", json={"amount": 40000.0}, headers=headers)
    assert pay2_res.status_code == 200
    p2_data = pay2_res.json()
    print(f"После полного погашения: оплачено={p2_data['paid_amount']}, остаток={p2_data['remaining_amount']}, статус={p2_data['status']}")
    assert p2_data["status"] == "Архив", f"Expected 'Архив', got {p2_data['status']}"
    assert p2_data["remaining_amount"] == 0.0

    print("\n--- 9. Проверка поиска записей ---")
    search_res = client.get("/api/records?search=Тестовый", headers=headers)
    assert search_res.status_code == 200
    found = search_res.json()
    assert len(found) >= 1
    print(f"Поиск нашел: {found[0]['client_name']}")

    print("\n--- 10. Удаление тестовой записи ---")
    del_res = client.delete(f"/api/records/{created_item['id']}", headers=headers)
    assert del_res.status_code == 204
    print(f"Запись #{created_item['id']} успешно удалена!")

    print("\n==========================================")
    print("ВСЕ 10 ТЕСТОВ БЭКЕНДА УСПЕШНО ПРОЙДЕНЫ!")
    print("==========================================")

if __name__ == "__main__":
    test_full_workflow()
