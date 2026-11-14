import re
import calendar
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from fastapi import HTTPException, status
from ..models.record import Record
from ..schemas.record import RecordCreate, RecordUpdate, RecordPayment, RecordStats

RU_MONTHS = {
    "январ": 1, "феврал": 2, "март": 3, "апрел": 4, "ма": 5, "июн": 6,
    "июл": 7, "август": 8, "сентябр": 9, "октябр": 10, "ноябр": 11, "декабр": 12
}

def parse_period_end_date(period_str: Optional[str]) -> Optional[date]:
    """
    Извлекает дату окончания периода из строки любого распространенного формата:
    - YYYY-MM-DD или YYYY-MM-DD — YYYY-MM-DD
    - DD.MM.YYYY или DD.MM.YYYY — DD.MM.YYYY
    - Названия месяцев на русском, например 'Ноябрь 2026' или '20 ноября 2026'
    """
    if not period_str:
        return None
    s = period_str.strip()
    if not s:
        return None

    # 1. Поиск дат в формате YYYY-MM-DD
    iso_matches = re.findall(r'\b(\d{4})-(\d{1,2})-(\d{1,2})\b', s)
    if iso_matches:
        y, m, d = iso_matches[-1]
        try:
            return date(int(y), int(m), int(d))
        except ValueError:
            pass

    # 2. Поиск дат в формате DD.MM.YYYY
    dot_matches = re.findall(r'\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b', s)
    if dot_matches:
        d, m, y = dot_matches[-1]
        try:
            return date(int(y), int(m), int(d))
        except ValueError:
            pass

    # 3. Русские месяцы, например 'Ноябрь 2026'
    s_lower = s.lower()
    for prefix, m_num in RU_MONTHS.items():
        if prefix in s_lower:
            y_match = re.search(r'\b(20\d\d)\b', s_lower)
            year = int(y_match.group(1)) if y_match else datetime.now().year

            d_match = re.search(r'\b(\d{1,2})\s+' + prefix, s_lower)
            if d_match:
                day = int(d_match.group(1))
            else:
                _, last_day = calendar.monthrange(year, m_num)
                day = last_day
            try:
                return date(year, m_num, day)
            except ValueError:
                pass

    return None

def is_period_expired(period_str: Optional[str]) -> bool:
    """
    Проверяет, истек ли срок оказания услуг / выполнения задачи.
    До наступления конца даты (включая саму дату окончания) возвращает False.
    После наступления следующего дня возвращает True.
    """
    end_date = parse_period_end_date(period_str)
    if not end_date:
        return False
    today = datetime.now().date()
    return today > end_date

def calculate_status(
    total_amount: float,
    paid_amount: float,
    period: Optional[str] = None,
    is_completed: bool = False,
    current_status: Optional[str] = None
) -> str:
    """
    Бизнес-логика распределения статуса:
    1. Если задача в архиве или завершена -> 'Архив'.
    2. Если оплачено полностью (paid_amount >= total_amount) -> 'Активно'.
    3. Если есть недоплата (paid_amount < total_amount):
       - До окончания срока (пока срок не истек) -> 'Активно' (даже при недоплате).
       - После окончания срока (срок истек, а оплата не закрыта) -> 'Долг'.
    """
    if is_completed or current_status == "Архив":
        return "Архив"

    if paid_amount >= total_amount:
        return "Активно"

    # Есть недоплата: статус зависит от срока
    if is_period_expired(period):
        return "Долг"
    else:
        return "Активно"

def sync_records_status(db: Session) -> None:
    """
    Автоматическая актуализация статусов (Активно / Долг) с учетом текущей даты.
    Архивные записи не затрагиваются.
    """
    records = db.query(Record).filter(Record.status.in_(["Активно", "Долг"])).all()
    changed = False
    for r in records:
        target_status = calculate_status(
            total_amount=float(r.total_amount or 0.0),
            paid_amount=float(r.paid_amount or 0.0),
            period=r.period,
            is_completed=False,
            current_status=r.status
        )
        if r.status != target_status:
            r.status = target_status
            changed = True
    if changed:
        db.commit()

def create_record(db: Session, record_in: RecordCreate) -> Record:
    auto_status = calculate_status(
        total_amount=record_in.total_amount,
        paid_amount=record_in.paid_amount,
        period=record_in.period,
        is_completed=record_in.is_completed or (record_in.status == "Архив")
    )
    
    db_record = Record(
        client_name=record_in.client_name.strip(),
        phone_number=record_in.phone_number.strip(),
        total_amount=round(record_in.total_amount, 2),
        paid_amount=round(record_in.paid_amount, 2),
        period=record_in.period.strip(),
        task_description=record_in.task_description.strip(),
        status=auto_status,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_records(
    db: Session,
    tab: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Record]:
    # Актуализируем статусы с учетом текущей даты и сроков
    sync_records_status(db)

    query = db.query(Record)

    if tab:
        # Вкладка 'Записи' соответствует статусу 'Активно' в базе данных
        if tab in ["Записи", "Активно"]:
            query = query.filter(Record.status == "Активно")
        elif tab == "Долг":
            query = query.filter(Record.status == "Долг")
        elif tab == "Архив":
            query = query.filter(Record.status == "Архив")
        else:
            query = query.filter(Record.status == tab)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Record.client_name.ilike(search_fmt),
                Record.phone_number.ilike(search_fmt),
                Record.task_description.ilike(search_fmt),
                Record.period.ilike(search_fmt)
            )
        )

    return query.order_by(desc(Record.updated_at)).offset(skip).limit(limit).all()

def get_record_by_id(db: Session, record_id: int) -> Record:
    rec = db.query(Record).filter(Record.id == record_id).first()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Запись #{record_id} не найдена"
        )
    return rec

def update_record(db: Session, record_id: int, record_in: RecordUpdate) -> Record:
    db_record = get_record_by_id(db, record_id)

    update_data = record_in.model_dump(exclude_unset=True)

    if "client_name" in update_data and update_data["client_name"] is not None:
        db_record.client_name = update_data["client_name"].strip()
    if "phone_number" in update_data and update_data["phone_number"] is not None:
        db_record.phone_number = update_data["phone_number"].strip()
    if "period" in update_data and update_data["period"] is not None:
        db_record.period = update_data["period"].strip()
    if "task_description" in update_data and update_data["task_description"] is not None:
        db_record.task_description = update_data["task_description"].strip()
    
    if "total_amount" in update_data and update_data["total_amount"] is not None:
        db_record.total_amount = round(update_data["total_amount"], 2)
    if "paid_amount" in update_data and update_data["paid_amount"] is not None:
        db_record.paid_amount = round(update_data["paid_amount"], 2)

    # Пересчет статуса
    manual_status = update_data.get("status")
    if manual_status:
        if manual_status == "Архив":
            db_record.status = "Архив"
        else:
            db_record.status = calculate_status(
                total_amount=float(db_record.total_amount),
                paid_amount=float(db_record.paid_amount),
                period=db_record.period,
                is_completed=False,
                current_status=manual_status
            )
    else:
        # Автоматический пересчет по срокам и оплате
        db_record.status = calculate_status(
            total_amount=float(db_record.total_amount),
            paid_amount=float(db_record.paid_amount),
            period=db_record.period,
            is_completed=(db_record.status == "Архив"),
            current_status=db_record.status
        )

    db_record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_record)
    return db_record

def add_payment(db: Session, record_id: int, payment_in: RecordPayment) -> Record:
    """
    Внесение доплаты:
    Увеличивает paid_amount на указанную сумму.
    При полной оплате переносится в Архив (если срок истек) или остается в Активно.
    При остатке долга: Долг (если срок истек) или Активно (если срок еще идет).
    """
    db_record = get_record_by_id(db, record_id)

    current_paid = float(db_record.paid_amount or 0.0)
    current_total = float(db_record.total_amount or 0.0)

    new_paid = round(current_paid + payment_in.amount, 2)
    db_record.paid_amount = new_paid

    if new_paid >= current_total:
        if is_period_expired(db_record.period):
            db_record.status = "Архив"
        else:
            db_record.status = "Активно"
    else:
        if is_period_expired(db_record.period):
            db_record.status = "Долг"
        else:
            db_record.status = "Активно"

    db_record.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_record)
    return db_record

def delete_record(db: Session, record_id: int) -> bool:
    db_record = get_record_by_id(db, record_id)
    db.delete(db_record)
    db.commit()
    return True

def get_statistics(db: Session) -> RecordStats:
    # Актуализируем статусы перед подсчетом статистики
    sync_records_status(db)

    all_records = db.query(Record).all()
    
    total_records = len(all_records)
    active_count = sum(1 for r in all_records if r.status == "Активно")
    debt_count = sum(1 for r in all_records if r.status == "Долг")
    archive_count = sum(1 for r in all_records if r.status == "Архив")
    
    total_revenue = sum(float(r.paid_amount or 0.0) for r in all_records)
    total_debt = sum(r.remaining_amount for r in all_records if r.status == "Долг")

    return RecordStats(
        total_records=total_records,
        active_count=active_count,
        debt_count=debt_count,
        archive_count=archive_count,
        total_revenue=round(total_revenue, 2),
        total_debt=round(total_debt, 2)
    )
