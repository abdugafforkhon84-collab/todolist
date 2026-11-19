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
    return get_statistics(db, user_id=current_user.id)

@router.get("", response_model=List[RecordResponse])
def list_records(
    tab: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_records(db, user_id=current_user.id, tab=tab, search=search, skip=skip, limit=limit)

@router.get("/{record_id}", response_model=RecordResponse)
def get_one_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_record_by_id(db, record_id, user_id=current_user.id)

@router.post("", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
def add_new_record(
    record_in: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_record(db, record_in, user_id=current_user.id)

@router.put("/{record_id}", response_model=RecordResponse)
def modify_record(
    record_id: int,
    record_in: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_record(db, record_id, record_in, user_id=current_user.id)

@router.post("/{record_id}/payment", response_model=RecordResponse)
def make_payment(
    record_id: int,
    payment_in: RecordPayment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return add_payment(db, record_id, payment_in, user_id=current_user.id)

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delete_record(db, record_id, user_id=current_user.id)
    return None
