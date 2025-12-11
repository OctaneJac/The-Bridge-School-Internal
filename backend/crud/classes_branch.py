from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from core.db import get_db
from core.auth import require_role, TokenData

from models.class_model import Class

router = APIRouter(tags=["admin"])

@router.get("/classes/{branch_id}")
def get_classes(
    branch_id: int,
    db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    query = select(Class).where(Class.branch_id == branch_id)
    result = db.execute(query)
    classes = result.scalars().all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "class_teacher_id": c.class_teacher_id
        }
        for c in classes
    ]


@router.post('/promote/{class_id}')

@router.post('/create_student/{branch_id}')