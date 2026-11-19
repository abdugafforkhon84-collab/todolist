from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..schemas.user import UserCreate, UserUpdate, UserResponse
from ..models.user import User
from ..middlewares.auth import get_current_user
from ..controllers.auth_controller import get_password_hash

router = APIRouter(prefix="/api/users", tags=["Управление пользователями"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав. Только администратор может выполнять это действие."
        )
    return current_user

@router.get("", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Список всех пользователей (только для admin)"""
    return db.query(User).filter(User.role != "admin").order_by(User.created_at.desc()).all()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Создание нового пользователя (только для admin)"""
    existing = db.query(User).filter(User.username == user_in.username.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Пользователь с логином '{user_in.username}' уже существует"
        )
    
    new_user = User(
        username=user_in.username.strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip() if user_in.full_name else None,
        phone=user_in.phone.strip() if user_in.phone else None,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Обновление данных пользователя (только для admin)"""
    user = db.query(User).filter(User.id == user_id, User.role != "admin").first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    if user_in.username is not None:
        existing = db.query(User).filter(User.username == user_in.username.strip(), User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Логин '{user_in.username}' уже занят")
        user.username = user_in.username.strip()
    if user_in.full_name is not None:
        user.full_name = user_in.full_name.strip()
    if user_in.phone is not None:
        user.phone = user_in.phone.strip()
    if user_in.password is not None and user_in.password.strip():
        user.hashed_password = get_password_hash(user_in.password)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Удаление пользователя (только для admin). Также удаляет все его записи."""
    user = db.query(User).filter(User.id == user_id, User.role != "admin").first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    from ..models.record import Record
    db.query(Record).filter(Record.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return None
