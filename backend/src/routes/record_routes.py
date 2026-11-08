from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..schemas.record import (
    RecordCreate,
    RecordUpdate,
    RecordPayment,
    RecordResponse,
    RecordStats
)
from ..models.user import User
from ..middlewares.auth import get_current_user
from ..controllers.record_controller import (
    create_record,
    get_records,
    get_record_by_id,
    update_record,
    add_payment,
    delete_record,
    get_statistics
)

router = APIRouter(prefix="/api/records", tags=["Записи клиентов"])

@router.get("/stats", response_model=RecordStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Сводная статистика по всем клиентам и задолженностям"""
    return get_statistics(db)

@router.get("", response_model=List[RecordResponse])
def list_records(
    tab: Optional[str] = Query(None, description="Вкладка/статус: 'Активно', 'Долг', 'Архив'"),
    search: Optional[str] = Query(None, description="Поиск по имени, телефону или описанию"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение записей с фильтрацией по вкладкам и поиском"""
    return get_records(db, tab=tab, search=search, skip=skip, limit=limit)

@router.get("/{record_id}", response_model=RecordResponse)
def get_one_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получение отдельной записи по ID"""
    return get_record_by_id(db, record_id)

@router.post("", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
def add_new_record(
    record_in: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создание новой записи с автоматическим расчетом статуса:
    - paid < total ➔ 'Долг'
    - paid >= total ➔ 'Активно' или 'Архив'
    """
    return create_record(db, record_in)

@router.put("/{record_id}", response_model=RecordResponse)
def modify_record(
    record_id: int,
    record_in: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновление записи клиента"""
    return update_record(db, record_id, record_in)

@router.post("/{record_id}/payment", response_model=RecordResponse)
def make_payment(
    record_id: int,
    payment_in: RecordPayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Внесение доплаты по записи (вкладка Долг).
    При полном погашении суммы запись автоматически переносится в 'Архив'.
    """
    return add_payment(db, record_id, payment_in)

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Удаление записи"""
    delete_record(db, record_id)
    return None
