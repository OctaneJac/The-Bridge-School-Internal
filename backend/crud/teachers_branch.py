from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from core.db import get_db
from core.auth import require_role, TokenData

from models.class_model import Class
from models.user import User

router = APIRouter(tags=["admin"])

@router.get("/teachers/{branch_id}")
def get_teachers(
    branch_id: int,
    db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    query = select(User).where(
        User.branch_id == branch_id,
        User.role == "teacher"
    )
    result = db.execute(query)
    teachers = result.scalars().all()

    return [
        {
            "id": t.id,
            "first_name": t.first_name,
            "last_name": t.last_name,
            "email": t.email
        }
        for t in teachers
    ]