from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from core.db import get_db
from core.auth import get_current_user, require_role, TokenData

from models.class_model import Class
from models.user import User
from models.student import Student
from crud import classes_branch_router, teachers_branch_router

router = APIRouter(prefix="/admin", tags=["admin"])

# Include routers from crud module
router.include_router(classes_branch_router)
router.include_router(teachers_branch_router)

@router.get("/")
def admin_root(current_user: TokenData = Depends(require_role(["admin", "super_admin"]))):
    """Admin routes root endpoint - requires admin or super_admin role"""
    return {
        "message": "Admin routes",
        "user": {
            "id": current_user.id,
            "role": current_user.role,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "branch_id": current_user.branch_id
        }
    }

@router.post("/assign-teacher")
def assign_teacher(
    class_id: int,
    teacher_id: str,
    db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    # Ensure class exists
    result = db.execute(select(Class).where(Class.id == class_id))
    class_obj = result.scalar_one_or_none()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")

    # Ensure teacher exists and is a teacher
    result = db.execute(
        select(User).where(User.id == teacher_id, User.role == "teacher")
    )
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Assign teacher
    db.execute(
        update(Class)
        .where(Class.id == class_id)
        .values(class_teacher_id=teacher_id)
    )
    db.commit()

    return {"message": "Teacher assigned successfully"}


@router.post("/create-class")
def create_class(
    name: str,
    branch_id: int,
    db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    new_class = Class(
        name=name,
        branch_id=branch_id,
        session_id=1,  # TODO: Fix later
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return {
        "id": new_class.id,
        "name": new_class.name,
        "branch_id": new_class.branch_id
    }


@router.get("class_students/{class_id}")
def get_class_students(
    class_id: int,
    db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    result = db.execute(select(Student).where(Student.class_id == class_id))
    students = result.scalars().all()
    return [
        {
            "id": s.id,
            "student_name": s.name,
            "attendance_rate": s.email
        }
        for s in students
    ]