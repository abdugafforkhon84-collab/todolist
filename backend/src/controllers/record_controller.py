from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from fastapi import HTTPException, status
from ..models.record import Record
from ..schemas.record import RecordCreate, RecordUpdate, RecordPayment, RecordStats

def calculate_status(total_amount: float, paid_amount: float, is_completed: bool = False, current_status: Optional[str] = None) -> str:
    """
    Бизнес-логика автоматического распределения статуса:
    - Если оплачено меньше нужной суммы -> строго 'Долг'.
    - Если оплачено полностью (или больше):
        - если задача завершена (is_completed или был в 'Архив') -> 'Архив'
        - иначе -> 'Активно'
    """
    if paid_amount < total_amount:
        return "Долг"
    else:
        if is_completed or current_status == "Архив":
            return "Архив"
        return "Активно"

def create_record(db: Session, record_in: RecordCreate) -> Record:
    auto_status = calculate_status(
        total_amount=record_in.total_amount,
        paid_amount=record_in.paid_amount,
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
        # Если вручную запрошен статус (например, перевод в Архив), но оплачено меньше суммы -> всё равно Долг
        if float(db_record.paid_amount) < float(db_record.total_amount):
            db_record.status = "Долг"
        else:
            db_record.status = manual_status
    else:
        # Автоматический пересчет
        db_record.status = calculate_status(
            total_amount=float(db_record.total_amount),
            paid_amount=float(db_record.paid_amount),
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
    При полном погашении долга (paid_amount >= total_amount)
    запись автоматически переносится в 'Архив'.
    """
    db_record = get_record_by_id(db, record_id)

    current_paid = float(db_record.paid_amount or 0.0)
    current_total = float(db_record.total_amount or 0.0)

    new_paid = round(current_paid + payment_in.amount, 2)
    db_record.paid_amount = new_paid

    if new_paid >= current_total:
        # Долг полностью закрыт -> переносим в Архив!
        db_record.status = "Архив"
    else:
        # Остался долг -> остается в разделе Долг
        db_record.status = "Долг"

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
