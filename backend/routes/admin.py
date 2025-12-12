from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import select, update
from core.db import get_db
from core.auth import get_current_user, require_role, TokenData

from models.class_model import Class
from models.user import User
from models.student import Student
from models.attendance_record import AttendanceRecord, AttendanceStatusEnum
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
    

@router.get("/class_students/{class_id}")
def get_class_students(
    # class_id: int,
    # db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
    ):

    return [
        {
        "id": 123,
        "student_name": "Uzair",
        "attendance_rate": 95.5
        }
    ]

@router.post("/promote/{selectedClassId}")  # Use {selectedClassId} not ${selectedClassId}
def promote_class(
    selectedClassId: int,  # Path parameter
    student_ids: List[str] = Body(),  # Request body parameter
    # db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    # Now you can use both selectedClassId and student_ids
    return {"message": "Class promoted successfully", "class_id": selectedClassId, "student_ids": student_ids}  

@router.get("/students_all/{branch_id}")
def get_all_students(
    branch_id: int,
    # db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    return [
        {
        "student_id": 123,
        "student_name": "Uzair Ahmed",
        "class_id":1,
        "class_name": "Grade 10",
        "attendance_rate": 95.5
        }
    ]

@router.post("/create_student/{branch_id}")
def create_student(
    branch_id: int,
    name: str = Body(...),
    dob: str = Body(...),
    class_id: int = Body(...),
    # db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    return {
        "id": 123,
        "name": name,
        "dob": dob,
        "branch_id": branch_id,
        "class_id": class_id
    }


@router.post("/generate_report")
def generate_report(
    student_ids: List[int] = Body(...),
    exam_ids: List[int] = Body(...),
    # db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    # Mock data - in real implementation, this would query the database
    reports = []
    
    # Generate reports for each student-exam combination
    for student_id in student_ids:
        for exam_id in exam_ids:
            reports.append({
                "student_id": student_id,
                "student_name": "Student name",  # Mock name
                "exam_name": "final exam",  # Mock exam name
                "total_marks": 100,
                "date": "2024-01-15",
                "subjects": [
                    {
                        "subject": "Mathematics",
                        "total": 30,
                        "received": 28,
                        "grade": "A"
                    },
                    {
                        "subject": "Science",
                        "total": 30,
                        "received": 27,
                        "grade": "B"
                    }
                ]
            })
    
    return reports

@router.get("/get_all_exams/{class_id}")
def get_all_exams(
    class_id: int,
    # db: Session = Depends(get_db),
    # current_user: TokenData = Depends(require_role(["admin", "super_admin"]))
):
    return [
        {
        "exam_id": 1,
        "exam_name": "Quiz 2"
        },
        {
        "exam_id": 2,
        "exam_name": "Final Exam"
        }
    ]