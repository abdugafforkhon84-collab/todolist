-- Начальные данные для системы учета клиентов и оплат
-- Пользователь по умолчанию: логин admin / пароль admin123

INSERT OR IGNORE INTO users (id, username, hashed_password, full_name, role)
VALUES (
    1,
    'admin',
    '$2b$12$gJH80eYgANFoaJTbh.yMlOXW5DcO1QH50fRpdpsFxZRPaCbvqRO6G',
    'Главный администратор',
    'admin'
);

-- Тестовые записи:
-- 1. Активная запись (оплачено полностью, задача в процессе)
INSERT OR IGNORE INTO records (id, client_name, phone_number, total_amount, paid_amount, period, task_description, status)
VALUES (
    1,
    'Алексей Смирнов',
    '+7 (999) 123-45-67',
    45000.00,
    45000.00,
    'Ноябрь 2026',
    'Разработка посадочной страницы и настройка контекстной рекламы',
    'Активно'
);

-- 2. Запись с долгом (внесена предоплата 25 000 из 70 000, остаток 45 000)
INSERT OR IGNORE INTO records (id, client_name, phone_number, total_amount, paid_amount, period, task_description, status)
VALUES (
    2,
    'ООO "ТехноСфера" (Дмитрий)',
    '+7 (903) 765-43-21',
    70000.00,
    25000.00,
    '01.11.2026 - 30.11.2026',
    'Редизайн каталога продукции и интеграция с CRM-системой',
    'Долг'
);

-- 3. Еще одна запись с долгом (оплачено 0 из 30 000)
INSERT OR IGNORE INTO records (id, client_name, phone_number, total_amount, paid_amount, period, task_description, status)
VALUES (
    3,
    'Елена Васильева',
    '+7 (916) 555-88-22',
    30000.00,
    0.00,
    '4 квартал 2026',
    'Комплексное SEO-продвижение и копирайтинг для интернет-магазина',
    'Долг'
);

-- 4. Запись в архиве (все оплачено и завершено)
INSERT OR IGNORE INTO records (id, client_name, phone_number, total_amount, paid_amount, period, task_description, status)
VALUES (
    4,
    'ИП Соколов М.В.',
    '+7 (925) 333-22-11',
    55000.00,
    55000.00,
    'Октябрь 2026',
    'Техническая поддержка мобильного приложения и аудит безопасности',
    'Архив'
);
