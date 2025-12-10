from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from core.db import Base


class User(Base):
    __tablename__ = "User"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    first_name = Column(String(255))
    last_name = Column(String(255))
    role = Column(String(50), nullable=False)  # 'teacher', 'admin', 'super_admin'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="SET NULL"))
    
    # Relationships
    branch = relationship("Branch", back_populates="users")
    classes = relationship("Class", back_populates="class_teacher", foreign_keys="Class.class_teacher_id")
    teacher_courses = relationship("TeacherCourse", back_populates="teacher", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="teacher")

