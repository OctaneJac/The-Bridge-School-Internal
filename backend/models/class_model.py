from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.db import Base


class Class(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)  # e.g. Grade 8
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"))
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"))
    class_teacher_id = Column(UUID(as_uuid=True), ForeignKey("User.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    branch = relationship("Branch", back_populates="classes")
    session = relationship("Session", back_populates="classes")
    class_teacher = relationship("User", back_populates="classes", foreign_keys=[class_teacher_id])
    student_classes = relationship("StudentClass", back_populates="class_model", cascade="all, delete-orphan")
    class_courses = relationship("ClassCourse", back_populates="class_model", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="class_model", cascade="all, delete-orphan")

