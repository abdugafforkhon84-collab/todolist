from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class RecordBase(BaseModel):
    client_name: str = Field(..., min_length=1, description="Имя клиента")
    phone_number: str = Field(..., min_length=1, description="Номер телефона")
    total_amount: float = Field(..., ge=0, description="Сумма к оплате")
    paid_amount: float = Field(0.0, ge=0, description="Фактически оплачено")
    period: str = Field(..., min_length=1, description="Срок (период)")
    task_description: str = Field(..., min_length=1, description="Описание задачи")

class RecordCreate(RecordBase):
    is_completed: Optional[bool] = Field(False, description="Выполнено ли обязательство сразу")
    status: Optional[str] = None

class RecordUpdate(BaseModel):
    client_name: Optional[str] = None
    phone_number: Optional[str] = None
    total_amount: Optional[float] = Field(None, ge=0)
    paid_amount: Optional[float] = Field(None, ge=0)
    period: Optional[str] = None
    task_description: Optional[str] = None
    status: Optional[str] = None  # 'Активно', 'Долг', 'Архив'

class RecordPayment(BaseModel):
    amount: float = Field(..., gt=0, description="Сумма доплаты")

class RecordResponse(RecordBase):
    id: int
    status: str
    remaining_amount: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RecordStats(BaseModel):
    total_records: int
    active_count: int
    debt_count: int
    archive_count: int
    total_revenue: float
    total_debt: float
