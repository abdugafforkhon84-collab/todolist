from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .settings import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from ..models.user import User
    from ..models.record import Record
    from passlib.context import CryptContext
    
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if users exist, create default admin
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            admin_user = User(
                username="admin",
                hashed_password=pwd_context.hash("admin123"),
                full_name="Главный администратор",
                role="admin"
            )
            db.add(admin_user)
            db.commit()

        # Check if records exist, create initial records
        records_count = db.query(Record).count()
        if records_count == 0:
            demo_records = [
                Record(
                    client_name="Алексей Смирнов",
                    phone_number="+7 (999) 123-45-67",
                    total_amount=45000.0,
                    paid_amount=45000.0,
                    period="Ноябрь 2026",
                    task_description="Разработка посадочной страницы и настройка контекстной рекламы",
                    status="Активно"
                ),
                Record(
                    client_name="ООO 'ТехноСфера' (Дмитрий)",
                    phone_number="+7 (903) 765-43-21",
                    total_amount=70000.0,
                    paid_amount=25000.0,
                    period="01.11.2026 - 30.11.2026",
                    task_description="Редизайн каталога продукции и интеграция с CRM-системой",
                    status="Долг"
                ),
                Record(
                    client_name="Елена Васильева",
                    phone_number="+7 (916) 555-88-22",
                    total_amount=30000.0,
                    paid_amount=0.0,
                    period="4 квартал 2026",
                    task_description="Комплексное SEO-продвижение и копирайтинг для интернет-магазина",
                    status="Долг"
                ),
                Record(
                    client_name="ИП Соколов М.В.",
                    phone_number="+7 (925) 333-22-11",
                    total_amount=55000.0,
                    paid_amount=55000.0,
                    period="Октябрь 2026",
                    task_description="Техническая поддержка мобильного приложения и аудит безопасности",
                    status="Архив"
                ),
            ]
            for rec in demo_records:
                db.add(rec)
            db.commit()
    finally:
        db.close()
