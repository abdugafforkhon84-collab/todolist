from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime
from ..config.db import Base

class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(255), nullable=False, index=True)
    phone_number = Column(String(50), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    paid_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    period = Column(String(100), nullable=False)
    task_description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, index=True)  # 'Активно', 'Долг', 'Архив'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def remaining_amount(self) -> float:
        total = float(self.total_amount or 0.0)
        paid = float(self.paid_amount or 0.0)
        return max(0.0, round(total - paid, 2))
